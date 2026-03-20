import React, { useEffect, useState } from 'react';
import adminService, { Company } from '../../services/adminService';

const CompaniesPage: React.FC = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [form, setForm] = useState<Partial<Company>>({ name: '', industry: '', website: '' });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [message, setMessage] = useState('');

  const load = async () => {
    try {
      const page = await adminService.getCompanies(0, 50);
      setCompanies(page.content || []);
    } catch (e: any) {
      setMessage(e?.response?.data?.message || e.message);
    }
  };

  useEffect(() => { load(); }, []);

  const save = async () => {
    try {
      if (!form.name) return;
      if (editingId) {
        await adminService.updateCompany(editingId, form);
        setMessage('Company updated');
      } else {
        await adminService.createCompany(form);
        setMessage('Company created');
      }
      setEditingId(null);
      setForm({ name: '', industry: '', website: '' });
      await load();
    } catch (e: any) {
      setMessage(e?.response?.data?.message || e.message);
    }
  };

  const remove = async (id: number) => {
    try {
      await adminService.deleteCompany(id);
      await load();
    } catch (e: any) {
      setMessage(e?.response?.data?.message || e.message);
    }
  };

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold text-white">Companies Management</h1>
      {message && <div className="text-sm text-zinc-300">{message}</div>}
      <div className="grid md:grid-cols-4 gap-2">
        <input placeholder="Name" value={form.name || ''} onChange={(e) => setForm({ ...form, name: e.target.value })} className="px-3 py-2 rounded bg-zinc-900 border border-zinc-700 text-white" />
        <input placeholder="Industry" value={form.industry || ''} onChange={(e) => setForm({ ...form, industry: e.target.value })} className="px-3 py-2 rounded bg-zinc-900 border border-zinc-700 text-white" />
        <input placeholder="Website" value={form.website || ''} onChange={(e) => setForm({ ...form, website: e.target.value })} className="px-3 py-2 rounded bg-zinc-900 border border-zinc-700 text-white" />
        <button onClick={save} className="px-3 py-2 rounded bg-blue-600 text-white">{editingId ? 'Update' : 'Create'}</button>
      </div>
      <div className="overflow-auto border border-zinc-800 rounded">
        <table className="w-full text-sm">
          <thead className="bg-zinc-900 text-zinc-300">
            <tr><th className="p-2 text-left">ID</th><th className="p-2 text-left">Name</th><th className="p-2 text-left">Industry</th><th className="p-2 text-left">Website</th><th className="p-2">Actions</th></tr>
          </thead>
          <tbody>
            {companies.map((c) => (
              <tr key={c.id} className="border-t border-zinc-800 text-zinc-200">
                <td className="p-2">{c.id}</td>
                <td className="p-2">{c.name}</td>
                <td className="p-2">{c.industry || '-'}</td>
                <td className="p-2">{c.website || '-'}</td>
                <td className="p-2 flex gap-2 justify-center">
                  <button onClick={() => { setEditingId(c.id); setForm(c); }} className="px-2 py-1 rounded bg-amber-700 text-white">Edit</button>
                  <button onClick={() => remove(c.id)} className="px-2 py-1 rounded bg-rose-700 text-white">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CompaniesPage;
