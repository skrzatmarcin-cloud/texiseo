import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user || user.role !== 'admin') {
            return Response.json({ error: 'Admin access required' }, { status: 403 });
        }

        const { workspace_id, module_type } = await req.json();

        if (!workspace_id || !module_type) {
            return Response.json({ error: 'Missing workspace_id or module_type' }, { status: 400 });
        }

        const moduleNames = {
            crm: 'Sales (CRM)',
            mes: 'Production (MES)',
            wms: 'Inventory (WMS)',
            erp: 'Finance (ERP)',
            marketing: 'Marketing (SEO + Social)',
            ai_insights: 'AI Insights'
        };

        const moduleFeatures = {
            crm: ['Lead Management', 'Sales Pipeline', 'Customer Database', 'Reporting'],
            mes: ['Production Orders', 'Quality Control', 'Scheduling', 'Real-time Monitoring'],
            wms: ['Inventory Tracking', 'Warehouse Management', 'Stock Levels', 'Reordering'],
            erp: ['Financial Reports', 'Budget Planning', 'Invoice Management', 'Cost Analysis'],
            marketing: ['SEO Tools', 'Social Media Scheduler', 'Content Calendar', 'Analytics'],
            ai_insights: ['Predictive Analytics', 'Trend Analysis', 'Recommendations', 'Automation Rules']
        };

        // Check if module already exists
        const existing = await base44.entities.EnterpriseModule.filter({
            workspace_id,
            module_type
        }).then(results => results?.[0]);

        if (existing) {
            // Update status to active
            await base44.entities.EnterpriseModule.update(existing.id, {
                status: 'active',
                last_used: new Date().toISOString()
            });
        } else {
            // Create new module
            await base44.entities.EnterpriseModule.create({
                workspace_id,
                module_type,
                module_name: moduleNames[module_type],
                status: 'active',
                description: `${moduleNames[module_type]} module`,
                features: moduleFeatures[module_type],
                activated_at: new Date().toISOString(),
                last_used: new Date().toISOString()
            });
        }

        console.log(`✅ Module ${module_type} activated for workspace ${workspace_id}`);

        return Response.json({
            status: 'success',
            message: `${moduleNames[module_type]} activated successfully`,
            module: {
                type: module_type,
                name: moduleNames[module_type],
                status: 'active',
                features: moduleFeatures[module_type]
            }
        });

    } catch (error) {
        console.error('Module activation error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});