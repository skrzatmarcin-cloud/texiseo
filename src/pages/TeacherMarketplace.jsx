import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Search, Star, MapPin, Users, BookOpen, Loader2 } from "lucide-react";

export default function TeacherMarketplace() {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterLanguage, setFilterLanguage] = useState("all");

  useEffect(() => {
    loadTeachers();
  }, []);

  const loadTeachers = async () => {
    setLoading(true);
    try {
      const data = await base44.entities.Teachers.list("-created_date", 100).catch(() => []);
      setTeachers(data.filter(t => t.status === "active"));
    } catch (err) {
      console.error("Load error:", err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = teachers.filter(t => {
    const matchSearch = t.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       t.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       t.bio?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchLang = filterLanguage === "all" || (t.languages || []).includes(filterLanguage);
    return matchSearch && matchLang;
  });

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white px-6 py-6">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-2xl font-bold mb-4">Teacher Marketplace</h1>
          <p className="text-blue-100 text-sm">Find & hire professional teachers for online lessons</p>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="max-w-6xl mx-auto px-6 py-6">
        <div className="flex gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search teachers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
          <select
            value={filterLanguage}
            onChange={(e) => setFilterLanguage(e.target.value)}
            className="px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            <option value="all">All Languages</option>
            <option value="English">English</option>
            <option value="Spanish">Spanish</option>
            <option value="French">French</option>
            <option value="German">German</option>
          </select>
        </div>

        {/* Teachers Grid */}
        {filtered.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No teachers found matching your criteria</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(teacher => (
              <div key={teacher.id} className="bg-card border border-border rounded-xl overflow-hidden hover:shadow-lg transition-shadow">
                {/* Photo */}
                <div className="h-48 bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                  {teacher.photo_url ? (
                    <img src={teacher.photo_url} alt={teacher.first_name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="h-20 w-20 bg-primary/20 rounded-full flex items-center justify-center text-2xl font-bold text-primary">
                      {teacher.first_name?.[0]}{teacher.last_name?.[0]}
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-bold">{teacher.first_name} {teacher.last_name}</h3>
                    {teacher.rating && (
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                        <span className="text-sm font-bold">{teacher.rating}</span>
                      </div>
                    )}
                  </div>

                  <p className="text-sm text-muted-foreground mb-3">{teacher.bio || "Professional teacher"}</p>

                  {/* Languages */}
                  {teacher.languages && teacher.languages.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {teacher.languages.slice(0, 3).map((lang, i) => (
                        <span key={i} className="text-[10px] px-2 py-0.5 bg-primary/10 text-primary rounded-full">
                          {lang}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-2 mb-3 pb-3 border-t border-border">
                    {teacher.total_lessons && (
                      <div className="flex items-center gap-1 text-xs pt-2">
                        <BookOpen className="h-3 w-3 text-muted-foreground" />
                        <span className="text-muted-foreground">{teacher.total_lessons} lessons</span>
                      </div>
                    )}
                    {teacher.hourly_rate && (
                      <div className="flex items-center gap-1 text-xs pt-2">
                        <span className="text-muted-foreground font-bold">${teacher.hourly_rate}/hr</span>
                      </div>
                    )}
                  </div>

                  {/* Button */}
                  <button className="w-full py-2 bg-primary text-white text-sm rounded-lg hover:bg-primary/90 font-medium">
                    Book Lesson
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}