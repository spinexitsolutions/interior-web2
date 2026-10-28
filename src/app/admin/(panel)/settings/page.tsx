import { readDB } from "@/lib/db";
import { SETTINGS_SCHEMA } from "@/lib/schemas";
import { SchemaForm } from "@/components/admin/forms";
import { AccountForm, ResetDemo } from "@/components/admin/account";
import { changePassword, resetDemo, saveSettings } from "../../actions";

export default async function SettingsPage() {
  const db = await readDB();
  return (
    <div className="space-y-10">
      <SchemaForm
        title={<h1 className="text-xl font-bold">Settings & theme</h1>}
        schema={SETTINGS_SCHEMA}
        initial={db.settings}
        save={saveSettings}
      />
      <AccountForm email={db.admin?.email ?? process.env.ADMIN_EMAIL ?? "admin@aangan.studio"} save={changePassword} />
      <ResetDemo reset={resetDemo} />
    </div>
  );
}
