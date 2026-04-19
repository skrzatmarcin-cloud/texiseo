# 🚀 PHASE 1 IMPLEMENTATION GUIDE: Mirror (Months 0-3)

## Objective
Build a perfect replica of WordPress + MasterStudy in Base44, with 2-way data sync, so we can begin optimization and feature development without touching WordPress.

---

## STEP 1: WORDPRESS DATA EXTRACTION SETUP

### 1.1 Create TexySEO Companion Plugin

**File:** `wordpress-plugins/texiseo-companion/texiseo-companion.php`

```php
<?php
/*
Plugin Name: TexySEO Companion
Description: Secure API bridge for TexySEO platform
Version: 1.0.0
Author: TexySEO Team
*/

// Register custom REST API endpoints
add_action('rest_api_init', function() {
    // Full site export endpoint
    register_rest_route('texiseo-companion/v1', '/full-site-export', array(
        'methods' => 'GET',
        'callback' => 'texiseo_export_site',
        'permission_callback' => 'texiseo_check_auth'
    ));
    
    // Incremental sync endpoint
    register_rest_route('texiseo-companion/v1', '/incremental-sync', array(
        'methods' => 'GET',
        'callback' => 'texiseo_incremental_sync',
        'permission_callback' => 'texiseo_check_auth'
    ));
    
    // Course structure endpoint
    register_rest_route('texiseo-companion/v1', '/course-structure', array(
        'methods' => 'GET',
        'callback' => 'texiseo_get_course_structure',
        'permission_callback' => 'texiseo_check_auth'
    ));
    
    // More endpoints...
});

// Authentication check
function texiseo_check_auth() {
    $token = isset($_SERVER['HTTP_X_TEXISEO_TOKEN']) ? $_SERVER['HTTP_X_TEXISEO_TOKEN'] : '';
    $stored_token = get_option('texiseo_api_token');
    return $token === $stored_token && current_user_can('manage_options');
}

// Full site export
function texiseo_export_site() {
    return array(
        'site_metadata' => get_bloginfo(),
        'pages' => get_posts(array('post_type' => 'page', 'numberposts' => -1)),
        'posts' => get_posts(array('post_type' => 'post', 'numberposts' => -1)),
        'courses' => get_posts(array('post_type' => 'masterstudy_course', 'numberposts' => -1)),
        'lessons' => get_posts(array('post_type' => 'masterstudy_lesson', 'numberposts' => -1)),
        'users' => get_users(),
        'categories' => get_terms('category'),
        'plugin_status' => get_plugins(),
        'seo_metadata' => texiseo_get_yoast_metadata()
    );
}

// More functions...
?>
```

**Installation Steps:**
1. Deploy plugin to `/wp-content/plugins/texiseo-companion/`
2. Activate in WordPress admin
3. Generate API token in plugin settings
4. Test endpoints from Base44

### 1.2 Test REST API Endpoints

**Base44 Function:** `functions/testWordPressAPI.js`

```javascript
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const wpUrl = Deno.env.get('WORDPRESS_URL') || 'https://example.com';
        const wpToken = Deno.env.get('WORDPRESS_API_TOKEN');

        // Test WordPress REST API
        const testsRes = await fetch(`${wpUrl}/wp-json/wp/v2/pages?per_page=1`, {
            headers: { 'Authorization': `Bearer ${wpToken}` }
        });

        // Test TexySEO Companion API
        const companionRes = await fetch(`${wpUrl}/wp-json/texiseo-companion/v1/full-site-export`, {
            headers: { 'X-TexySEO-Token': wpToken }
        });

        const pageData = await testsRes.json();
        const siteData = await companionRes.json();

        return Response.json({
            status: 'success',
            tests: {
                wp_rest_api: testsRes.ok ? 'OK' : 'FAILED',
                texiseo_companion: companionRes.ok ? 'OK' : 'FAILED',
                sample_pages: pageData.length,
                site_metadata: siteData.site_metadata
            }
        });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});
```

---

## STEP 2: BUILD BASE44 ENTITY MODELS

### 2.1 Create Entities for Data Mirroring

**Entity Files** (as JSON schemas):

#### `entities/WordPressPage.json`
```json
{
  "name": "WordPressPage",
  "type": "object",
  "properties": {
    "wp_post_id": { "type": "number", "title": "WordPress Post ID" },
    "title": { "type": "string" },
    "content": { "type": "string", "description": "HTML content" },
    "slug": { "type": "string" },
    "status": { "type": "string", "enum": ["publish", "draft", "trash"] },
    "parent_id": { "type": "number" },
    "menu_order": { "type": "number" },
    "featured_image_id": { "type": "number" },
    "seo_title": { "type": "string" },
    "seo_description": { "type": "string" },
    "seo_keywords": { "type": "string" },
    "robots": { "type": "string", "description": "noindex, nofollow, etc." },
    "canonical_url": { "type": "string" },
    "last_synced_at": { "type": "string", "format": "date-time" },
    "wp_last_modified": { "type": "string", "format": "date-time" },
    "sync_status": { "type": "string", "enum": ["synced", "pending", "failed", "partial"] }
  },
  "required": ["wp_post_id", "title", "content", "status"]
}
```

#### `entities/MasterStudyCourse.json`
```json
{
  "name": "MasterStudyCourse",
  "type": "object",
  "properties": {
    "wp_post_id": { "type": "number" },
    "title": { "type": "string" },
    "description": { "type": "string" },
    "language": { "type": "string", "enum": ["english", "spanish", "french", "german", "italian", "portuguese", "chinese", "japanese", "arabic", "russian"] },
    "level": { "type": "string", "enum": ["A1", "A2", "B1", "B2", "C1", "C2"] },
    "status": { "type": "string", "enum": ["publish", "draft"] },
    "instructor_id": { "type": "number" },
    "featured_image_url": { "type": "string" },
    "price": { "type": "number" },
    "currency": { "type": "string", "default": "USD" },
    "lesson_count": { "type": "number" },
    "student_count": { "type": "number" },
    "rating": { "type": "number", "minimum": 0, "maximum": 5 },
    "review_count": { "type": "number" },
    "created_at": { "type": "string", "format": "date-time" },
    "last_synced_at": { "type": "string", "format": "date-time" },
    "sync_status": { "type": "string", "enum": ["synced", "pending", "failed"] }
  },
  "required": ["wp_post_id", "title", "language", "level", "status"]
}
```

#### `entities/MasterStudyLesson.json`
```json
{
  "name": "MasterStudyLesson",
  "type": "object",
  "properties": {
    "wp_post_id": { "type": "number" },
    "course_id": { "type": "string" },
    "title": { "type": "string" },
    "description": { "type": "string" },
    "content": { "type": "string" },
    "video_url": { "type": "string" },
    "order": { "type": "number" },
    "duration_minutes": { "type": "number" },
    "has_quiz": { "type": "boolean" },
    "status": { "type": "string", "enum": ["publish", "draft"] },
    "created_at": { "type": "string", "format": "date-time" },
    "last_synced_at": { "type": "string", "format": "date-time" }
  },
  "required": ["wp_post_id", "course_id", "title", "status"]
}
```

### 2.2 Sync Status Entities

#### `entities/SyncLog.json`
```json
{
  "name": "SyncLog",
  "type": "object",
  "properties": {
    "sync_type": { "type": "string", "enum": ["full", "incremental", "course", "lesson", "user"] },
    "started_at": { "type": "string", "format": "date-time" },
    "completed_at": { "type": "string", "format": "date-time" },
    "duration_seconds": { "type": "number" },
    "status": { "type": "string", "enum": ["success", "failed", "partial"] },
    "records_processed": { "type": "number" },
    "records_created": { "type": "number" },
    "records_updated": { "type": "number" },
    "records_deleted": { "type": "number" },
    "error_message": { "type": "string" },
    "next_sync_scheduled": { "type": "string", "format": "date-time" }
  },
  "required": ["sync_type", "status"]
}
```

---

## STEP 3: BUILD THE DATA SYNC AGENT

### 3.1 Create DataSyncAgent Function

**File:** `functions/dataSyncAgent.js`

```javascript
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const WP_URL = Deno.env.get('WORDPRESS_URL');
const WP_TOKEN = Deno.env.get('WORDPRESS_API_TOKEN');

async function fetchFromWordPress(endpoint) {
    const response = await fetch(`${WP_URL}${endpoint}`, {
        headers: {
            'Authorization': `Bearer ${WP_TOKEN}`,
            'Content-Type': 'application/json'
        }
    });
    if (!response.ok) throw new Error(`WordPress API error: ${response.statusText}`);
    return response.json();
}

async function syncPages(base44) {
    console.log('🔄 Syncing WordPress Pages...');
    const pages = await fetchFromWordPress('/wp-json/wp/v2/pages?per_page=100');
    
    for (const page of pages) {
        const existingPage = await base44.entities.WordPressPage.filter(
            { wp_post_id: page.id }
        ).then(results => results[0]);

        const pageData = {
            wp_post_id: page.id,
            title: page.title.rendered,
            content: page.content.rendered,
            slug: page.slug,
            status: page.status,
            parent_id: page.parent,
            seo_title: page.yoast_head_json?.title || page.title.rendered,
            seo_description: page.yoast_head_json?.description || '',
            last_synced_at: new Date().toISOString(),
            wp_last_modified: page.modified,
            sync_status: 'synced'
        };

        if (existingPage) {
            await base44.entities.WordPressPage.update(existingPage.id, pageData);
        } else {
            await base44.entities.WordPressPage.create(pageData);
        }
    }
    
    console.log(`✅ Synced ${pages.length} pages`);
    return pages.length;
}

async function syncCourses(base44) {
    console.log('🔄 Syncing MasterStudy Courses...');
    const courses = await fetchFromWordPress('/wp-json/masterstudy-lms/v1/courses');
    
    for (const course of courses) {
        const courseData = {
            wp_post_id: course.id,
            title: course.title,
            description: course.description,
            language: course.language || 'english',
            level: course.level || 'A1',
            status: course.status,
            instructor_id: course.instructor_id,
            featured_image_url: course.featured_image_url,
            price: course.price || 0,
            lesson_count: course.lessons_count || 0,
            student_count: course.students_count || 0,
            rating: course.rating || 0,
            created_at: course.created_at,
            last_synced_at: new Date().toISOString(),
            sync_status: 'synced'
        };

        const existingCourse = await base44.entities.MasterStudyCourse.filter(
            { wp_post_id: course.id }
        ).then(results => results[0]);

        if (existingCourse) {
            await base44.entities.MasterStudyCourse.update(existingCourse.id, courseData);
        } else {
            await base44.entities.MasterStudyCourse.create(courseData);
        }
    }
    
    console.log(`✅ Synced ${courses.length} courses`);
    return courses.length;
}

async function logSync(base44, syncType, status, recordsProcessed) {
    await base44.entities.SyncLog.create({
        sync_type: syncType,
        status: status,
        records_processed: recordsProcessed,
        completed_at: new Date().toISOString(),
        next_sync_scheduled: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString()
    });
}

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user || user.role !== 'admin') {
            return Response.json({ error: 'Admin access required' }, { status: 403 });
        }

        const startTime = Date.now();

        // Run sync operations
        const pageCount = await syncPages(base44);
        const courseCount = await syncCourses(base44);
        // More sync operations...

        const duration = (Date.now() - startTime) / 1000;
        
        await logSync(base44, 'full', 'success', pageCount + courseCount);

        return Response.json({
            status: 'success',
            message: 'Data sync completed',
            summary: {
                pages_synced: pageCount,
                courses_synced: courseCount,
                duration_seconds: duration,
                next_sync: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString()
            }
        });

    } catch (error) {
        console.error('Sync error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});
```

---

## STEP 4: CREATE STUDENT & TEACHER PORTALS

### 4.1 Student Portal (Pages & Components)

**File:** `pages/StudentPortal.jsx`

```jsx
import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Loader2, BookOpen, CheckCircle2, Clock, Award } from 'lucide-react';

export default function StudentPortal() {
    const [user, setUser] = useState(null);
    const [enrolledCourses, setEnrolledCourses] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadData() {
            const currentUser = await base44.auth.me();
            setUser(currentUser);

            // Fetch enrolled courses
            const courses = await base44.entities.MasterStudyCourse.filter(
                { status: 'publish' },
                '-created_at',
                10
            );
            setEnrolledCourses(courses);
            setLoading(false);
        }
        loadData();
    }, []);

    if (loading) return <div className="flex items-center justify-center min-h-screen"><Loader2 className="animate-spin" /></div>;

    return (
        <div className="min-h-screen bg-background p-6">
            <h1 className="text-3xl font-bold mb-8">Welcome, {user?.full_name}!</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <div className="bg-card p-4 rounded-lg border border-border">
                    <div className="flex items-center gap-3">
                        <BookOpen className="h-6 w-6 text-primary" />
                        <div>
                            <p className="text-sm text-muted-foreground">Active Courses</p>
                            <p className="text-2xl font-bold">{enrolledCourses.length}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-card p-4 rounded-lg border border-border">
                    <div className="flex items-center gap-3">
                        <CheckCircle2 className="h-6 w-6 text-emerald-500" />
                        <div>
                            <p className="text-sm text-muted-foreground">Completed</p>
                            <p className="text-2xl font-bold">3</p>
                        </div>
                    </div>
                </div>

                <div className="bg-card p-4 rounded-lg border border-border">
                    <div className="flex items-center gap-3">
                        <Award className="h-6 w-6 text-amber-500" />
                        <div>
                            <p className="text-sm text-muted-foreground">Certificates</p>
                            <p className="text-2xl font-bold">2</p>
                        </div>
                    </div>
                </div>
            </div>

            <h2 className="text-2xl font-bold mb-4">My Courses</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {enrolledCourses.map(course => (
                    <div key={course.id} className="bg-card p-5 rounded-lg border border-border hover:shadow-lg transition-all">
                        <div className="flex items-start justify-between mb-3">
                            <h3 className="font-bold text-sm">{course.title}</h3>
                            <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-full">{course.level}</span>
                        </div>
                        <p className="text-xs text-muted-foreground mb-4 line-clamp-2">{course.description}</p>
                        <div className="flex items-center justify-between">
                            <div className="text-xs text-muted-foreground">
                                {course.lesson_count} lessons
                            </div>
                            <button className="text-xs px-3 py-1.5 bg-primary text-primary-foreground rounded hover:bg-primary/90">
                                Continue
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
```

### 4.2 Teacher Panel

**File:** `pages/TeacherPanel.jsx` (simplified excerpt)

```jsx
// Similar structure to StudentPortal
// Includes: Course management, student roster, grading, earnings, analytics
```

---

## STEP 5: SETUP AUTOMATION SCHEDULE

### 5.1 Create 2-Hourly Sync Automation

**Use Base44 Automations UI or API:**

```javascript
// This would be created in the Base44 platform
{
  automation_type: "scheduled",
  name: "WordPress Data Sync - Every 2 Hours",
  function_name: "dataSyncAgent",
  schedule_type: "simple",
  repeat_interval: 2,
  repeat_unit: "hours",
  is_active: true
}
```

---

## STEP 6: TESTING & VALIDATION

### 6.1 Test Sync Completeness

- [ ] All WordPress pages synced
- [ ] All MasterStudy courses synced
- [ ] All lessons extracted
- [ ] User accounts migrated
- [ ] SEO metadata captured
- [ ] Media references preserved
- [ ] No data loss
- [ ] Sync logs created

### 6.2 UI/UX Testing

- [ ] Student portal displays courses
- [ ] Teacher panel displays students
- [ ] Admin dashboard shows sync status
- [ ] Navigation works across all hubs
- [ ] Mobile responsive

### 6.3 Performance Benchmarks

- [ ] Sync completes in <30 minutes
- [ ] Page load time <2 seconds
- [ ] Search indexes built and queryable
- [ ] No database locks or timeouts

---

## DELIVERABLES (Phase 1)

✅ WordPress data extraction via REST API + Companion Plugin  
✅ Base44 entity models for courses, lessons, pages  
✅ 2-hourly automated data sync  
✅ Student portal (course browsing, enrollment, progress)  
✅ Teacher panel (course management, student overview)  
✅ Admin dashboard (sync status, health monitoring)  
✅ Full data parity with WordPress  
✅ Zero WordPress dependency in frontend  

---

**Phase 1 Timeline:** 8 weeks  
**Team:** 2 backend engineers, 1 frontend engineer, 1 product manager  
**Success Criteria:** All data synced, 100% feature parity, zero data loss