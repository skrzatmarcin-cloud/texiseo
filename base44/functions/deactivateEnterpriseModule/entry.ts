import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user || user.role !== 'admin') {
            return Response.json({ error: 'Admin access required' }, { status: 403 });
        }

        const { workspace_id, module_type } = await req.json();

        const moduleNames = {
            crm: 'Sales (CRM)',
            mes: 'Production (MES)',
            wms: 'Inventory (WMS)',
            erp: 'Finance (ERP)',
            marketing: 'Marketing (SEO + Social)',
            ai_insights: 'AI Insights'
        };

        const existing = await base44.entities.EnterpriseModule.filter({
            workspace_id,
            module_type
        }).then(results => results?.[0]);

        if (existing) {
            await base44.entities.EnterpriseModule.update(existing.id, {
                status: 'inactive'
            });
        }

        console.log(`✅ Module ${module_type} deactivated`);

        return Response.json({
            status: 'success',
            message: `${moduleNames[module_type]} deactivated`,
            module_type
        });

    } catch (error) {
        console.error('Module deactivation error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});