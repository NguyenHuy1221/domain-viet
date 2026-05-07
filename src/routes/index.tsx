import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";

export const Route = createFileRoute("/")({
  component: Dashboard,
});

type Platform = "WordPress" | "Shopify";
type SfStatus = "active" | "canceled" | "";

type Domain = {
  id: string;
  domain: string;
  note?: string;
  customer: string;
  dev: string;
  platform: Platform;
  rebuilds: number;
  domainExpiry: string; // yyyy-mm-dd
  fee: number;
  sfStatus: SfStatus;
  sfStart?: string;
  sfEnd?: string;
  sfPlan?: string;
};

const initialData: Domain[] = [
  { id: "1", domain: "saladbowl.vn", customer: "Trần Thị Mai", dev: "Bảo Ngọc", platform: "WordPress", rebuilds: 1, domainExpiry: "2026-05-20", fee: 350000, sfStatus: "" },
  { id: "2", domain: "greenmarket.vn", customer: "Đặng Quốc Bảo", dev: "Minh Khoa", platform: "WordPress", rebuilds: 2, domainExpiry: "2026-06-30", fee: 320000, sfStatus: "" },
  { id: "3", domain: "daklak-honey.vn", customer: "Phạm Thị Lan", dev: "Gia Hưng", platform: "WordPress", rebuilds: 0, domainExpiry: "2026-09-15", fee: 290000, sfStatus: "" },
  { id: "4", domain: "mooncake-bakery.com", note: "Khách hủy Shopify, chuyển WP", customer: "Lê Văn Hùng", dev: "Minh Khoa", platform: "WordPress", rebuilds: 3, domainExpiry: "2026-12-01", fee: 0, sfStatus: "canceled", sfStart: "2023-06-01", sfEnd: "2024-06-01", sfPlan: "Basic" },
  { id: "5", domain: "thanhdat-coffee.com", customer: "Nguyễn Thanh Đạt", dev: "Minh Khoa", platform: "Shopify", rebuilds: 2, domainExpiry: "2027-01-10", fee: 890000, sfStatus: "active", sfStart: "2024-01-10", sfEnd: "2026-07-10", sfPlan: "Shopify" },
  { id: "6", domain: "buonmathuot-tea.com", customer: "Hoàng Minh Tuấn", dev: "Bảo Ngọc", platform: "Shopify", rebuilds: 1, domainExpiry: "2027-03-01", fee: 790000, sfStatus: "active", sfStart: "2025-03-01", sfEnd: "2026-05-01", sfPlan: "Shopify" },
  { id: "7", domain: "evina-fashion.com", customer: "Vũ Thị Hoa", dev: "Gia Hưng", platform: "Shopify", rebuilds: 0, domainExpiry: "2027-08-15", fee: 890000, sfStatus: "active", sfStart: "2025-08-15", sfEnd: "2026-08-15", sfPlan: "Advanced" },
];

const fmtVND = (n: number) => n.toLocaleString("vi-VN") + "₫";
const fmtDate = (d: string) => {
  if (!d) return "—";
  const [y, m, day] = d.split("-");
  return `${day}/${m}/${y}`;
};
const daysUntil = (d: string) => {
  if (!d) return Infinity;
  const t = new Date(d).getTime();
  const now = new Date(); now.setHours(0, 0, 0, 0);
  return Math.ceil((t - now.getTime()) / 86400000);
};

function DaysPill({ date }: { date: string }) {
  const days = daysUntil(date);
  let cls = "bg-emerald-100 text-emerald-800";
  let label = `Còn ${days} ngày`;
  if (days < 0) { cls = "bg-red-100 text-red-800"; label = `Quá hạn ${-days} ngày`; }
  else if (days <= 30) cls = "bg-amber-100 text-amber-800";
  return <span className={`inline-block px-2 py-0.5 text-xs font-medium ${cls}`} style={{ borderRadius: 999 }}>{label}</span>;
}

function Dots({ n }: { n: number }) {
  const total = 5;
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: total }).map((_, i) => (
        <span key={i} className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: i < n ? "#B5D4F4" : "#E5E7EB" }} />
      ))}
      <span className="ml-1 text-xs text-muted-foreground">{n}x</span>
    </div>
  );
}

type FormState = Omit<Domain, "id"> & { id?: string };
const emptyForm: FormState = {
  domain: "", customer: "", dev: "", platform: "WordPress", rebuilds: 0,
  domainExpiry: "", fee: 0, sfStatus: "", sfStart: "", sfEnd: "", sfPlan: "Basic", note: "",
};

function Dashboard() {
  const [data, setData] = useState<Domain[]>(initialData);
  const [search, setSearch] = useState("");
  const [platformFilter, setPlatformFilter] = useState<"all" | Platform>("all");
  const [expiringOnly, setExpiringOnly] = useState(false);
  const [sortKey, setSortKey] = useState<keyof Domain | "">("");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);

  const isExpiringSoon = (d: Domain) => {
    const dd = daysUntil(d.domainExpiry);
    const sd = d.sfStatus === "active" && d.sfEnd ? daysUntil(d.sfEnd) : Infinity;
    return (dd >= 0 && dd <= 30) || (sd >= 0 && sd <= 30);
  };

  const filtered = useMemo(() => {
    let rows = data.filter(d => {
      const q = search.trim().toLowerCase();
      if (q && !(d.domain.toLowerCase().includes(q) || d.customer.toLowerCase().includes(q) || d.dev.toLowerCase().includes(q))) return false;
      if (platformFilter !== "all" && d.platform !== platformFilter) return false;
      if (expiringOnly && !isExpiringSoon(d)) return false;
      return true;
    });
    if (sortKey) {
      rows = [...rows].sort((a, b) => {
        const av = a[sortKey] as any, bv = b[sortKey] as any;
        if (av < bv) return sortDir === "asc" ? -1 : 1;
        if (av > bv) return sortDir === "asc" ? 1 : -1;
        return 0;
      });
    }
    return rows;
  }, [data, search, platformFilter, expiringOnly, sortKey, sortDir]);

  const metrics = useMemo(() => {
    const total = data.length;
    const sfActive = data.filter(d => d.sfStatus === "active").length;
    const wp = data.filter(d => d.platform === "WordPress").length;
    const expiring = data.filter(isExpiringSoon).length;
    const sfCanceled = data.filter(d => d.sfStatus === "canceled").length;
    const totalFee = data.reduce((s, d) => s + (d.fee || 0), 0);
    return { total, sfActive, wp, expiring, sfCanceled, totalFee };
  }, [data]);

  const expiringList = useMemo(() => {
    const items: { name: string; date: string }[] = [];
    data.forEach(d => {
      const dd = daysUntil(d.domainExpiry);
      if (dd >= 0 && dd <= 30) items.push({ name: d.domain + " (domain)", date: d.domainExpiry });
      if (d.sfStatus === "active" && d.sfEnd) {
        const sd = daysUntil(d.sfEnd);
        if (sd >= 0 && sd <= 30) items.push({ name: d.domain + " (Shopify)", date: d.sfEnd });
      }
    });
    return items;
  }, [data]);

  const toggleSort = (k: keyof Domain) => {
    if (sortKey === k) setSortDir(sortDir === "asc" ? "desc" : "asc");
    else { setSortKey(k); setSortDir("asc"); }
  };
  const arrow = (k: keyof Domain) => sortKey === k ? (sortDir === "asc" ? " ↑" : " ↓") : "";

  const openAdd = () => { setForm({ ...emptyForm }); setModalOpen(true); };
  const openEdit = (d: Domain) => { setForm({ ...d }); setModalOpen(true); };
  const remove = (id: string) => { if (confirm("Xóa domain này?")) setData(data.filter(d => d.id !== id)); };

  const save = () => {
    if (!form.domain.trim()) { alert("Vui lòng nhập tên domain"); return; }
    if (form.id) {
      setData(data.map(d => d.id === form.id ? ({ ...form, id: form.id } as Domain) : d));
    } else {
      setData([...data, { ...form, id: Date.now().toString() } as Domain]);
    }
    setModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-white p-6 text-slate-900">
      <div className="mx-auto max-w-7xl space-y-4">
        <h1 className="text-2xl font-semibold">Quản lý Domain & Web</h1>

        {expiringList.length > 0 && (
          <div className="border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900" style={{ borderRadius: 8 }}>
            <strong>⚠ Sắp hết hạn (≤30 ngày):</strong>{" "}
            {expiringList.map((e, i) => (
              <span key={i}>
                {i > 0 && " · "}
                <span className="font-medium">{e.name}</span> <span className="text-amber-700">{fmtDate(e.date)}</span>
              </span>
            ))}
          </div>
        )}

        <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
          <MetricCard label="Tổng domain" value={metrics.total} />
          <MetricCard label="Shopify đang chạy" value={metrics.sfActive} valueClass="text-emerald-600" />
          <MetricCard label="WordPress" value={metrics.wp} />
          <MetricCard label="Sắp hết hạn (≤30 ngày)" value={metrics.expiring} valueClass="text-red-600" />
          <MetricCard label="Shopify đã hủy" value={metrics.sfCanceled} valueClass="text-amber-600" />
        </div>
        <div className="max-w-xs">
          <MetricCard label="Tổng phí/năm" value={fmtVND(metrics.totalFee)} />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Tìm domain, khách, dev..."
            className="flex-1 min-w-[200px] border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400"
            style={{ borderRadius: 6 }}
          />
          <select
            value={platformFilter}
            onChange={e => setPlatformFilter(e.target.value as any)}
            className="border border-slate-200 px-3 py-2 text-sm"
            style={{ borderRadius: 6 }}
          >
            <option value="all">Tất cả</option>
            <option value="WordPress">WordPress</option>
            <option value="Shopify">Shopify</option>
          </select>
          <button
            onClick={() => setExpiringOnly(!expiringOnly)}
            className={`border px-3 py-2 text-sm ${expiringOnly ? "border-amber-400 bg-amber-100 text-amber-900" : "border-slate-200 bg-white"}`}
            style={{ borderRadius: 6 }}
          >
            Sắp hết hạn
          </button>
          <button onClick={openAdd} className="ml-auto bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-700" style={{ borderRadius: 6 }}>
            + Thêm domain
          </button>
        </div>

        <div className="overflow-x-auto border border-slate-200" style={{ borderRadius: 8 }}>
          <table className="w-full text-sm">
            <thead className="bg-slate-50">
              <tr className="text-left">
                {([
                  ["domain", "Domain"],
                  ["customer", "Người đăng ký"],
                  ["dev", "Dev phụ trách"],
                  ["platform", "Nền tảng"],
                  ["rebuilds", "Làm lại"],
                  ["domainExpiry", "Hạn domain"],
                  ["sfEnd", "Hạn Shopify"],
                  ["fee", "Phí/năm"],
                ] as [keyof Domain, string][]).map(([k, label]) => (
                  <th key={k} onClick={() => toggleSort(k)} className="cursor-pointer px-3 py-2.5 font-medium text-slate-700 select-none">
                    {label}{arrow(k)}
                  </th>
                ))}
                <th className="px-3 py-2.5 font-medium text-slate-700">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(d => {
                const showCanceledBadge = d.sfStatus === "canceled";
                return (
                  <tr key={d.id} className="border-t border-slate-100 hover:bg-slate-50/60">
                    <td className="px-3 py-3 align-top">
                      <div className="font-semibold">{d.domain}</div>
                      {d.note && <div className="text-xs italic text-slate-500">{d.note}</div>}
                    </td>
                    <td className="px-3 py-3 align-top">{d.customer}</td>
                    <td className="px-3 py-3 align-top">{d.dev}</td>
                    <td className="px-3 py-3 align-top">
                      {showCanceledBadge ? (
                        <span className="inline-block bg-pink-100 px-2 py-0.5 text-xs font-medium text-pink-800 line-through" style={{ borderRadius: 999 }}>
                          ✕ Shopify (đã hủy)
                        </span>
                      ) : d.platform === "Shopify" ? (
                        <span className="inline-block bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-800" style={{ borderRadius: 999 }}>Shopify</span>
                      ) : (
                        <span className="inline-block bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800" style={{ borderRadius: 999 }}>WordPress</span>
                      )}
                    </td>
                    <td className="px-3 py-3 align-top"><Dots n={d.rebuilds} /></td>
                    <td className="px-3 py-3 align-top">
                      <DaysPill date={d.domainExpiry} />
                      <div className="mt-1 text-xs text-slate-500">{fmtDate(d.domainExpiry)}</div>
                    </td>
                    <td className="px-3 py-3 align-top">
                      {d.platform === "Shopify" && d.sfStatus === "active" && d.sfEnd ? (
                        <>
                          <DaysPill date={d.sfEnd} />
                          <div className="mt-1 text-xs text-slate-500">{fmtDate(d.sfStart || "")} → {fmtDate(d.sfEnd)}</div>
                        </>
                      ) : <span className="text-slate-400">—</span>}
                    </td>
                    <td className="px-3 py-3 align-top font-semibold">{fmtVND(d.fee)}</td>
                    <td className="px-3 py-3 align-top">
                      <div className="flex gap-1">
                        <button onClick={() => openEdit(d)} className="border border-slate-200 px-2 py-1 text-xs hover:bg-slate-100" style={{ borderRadius: 4 }}>Sửa</button>
                        <button onClick={() => remove(d.id)} className="border border-slate-200 px-2 py-1 text-xs hover:bg-red-50 hover:text-red-600 hover:border-red-200" style={{ borderRadius: 4 }}>Xóa</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr><td colSpan={9} className="px-3 py-10 text-center text-slate-400">Không có dữ liệu</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setModalOpen(false)}>
          <div className="w-full max-w-2xl bg-white p-6" style={{ borderRadius: 10 }} onClick={e => e.stopPropagation()}>
            <h2 className="mb-4 text-lg font-semibold">{form.id ? "Sửa domain" : "Thêm domain"}</h2>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <Field label="Tên domain *" full>
                <input value={form.domain} onChange={e => setForm({ ...form, domain: e.target.value })} className="w-full border border-slate-200 px-2 py-1.5" style={{ borderRadius: 6 }} />
              </Field>
              <Field label="Người đăng ký">
                <input value={form.customer} onChange={e => setForm({ ...form, customer: e.target.value })} className="w-full border border-slate-200 px-2 py-1.5" style={{ borderRadius: 6 }} />
              </Field>
              <Field label="Dev phụ trách">
                <input value={form.dev} onChange={e => setForm({ ...form, dev: e.target.value })} className="w-full border border-slate-200 px-2 py-1.5" style={{ borderRadius: 6 }} />
              </Field>
              <Field label="Nền tảng">
                <select value={form.platform} onChange={e => setForm({ ...form, platform: e.target.value as Platform })} className="w-full border border-slate-200 px-2 py-1.5" style={{ borderRadius: 6 }}>
                  <option>WordPress</option>
                  <option>Shopify</option>
                </select>
              </Field>
              <Field label="Hạn domain">
                <input type="date" value={form.domainExpiry} onChange={e => setForm({ ...form, domainExpiry: e.target.value })} className="w-full border border-slate-200 px-2 py-1.5" style={{ borderRadius: 6 }} />
              </Field>
              <Field label="Số lần làm lại">
                <input type="number" min={0} max={10} value={form.rebuilds} onChange={e => setForm({ ...form, rebuilds: +e.target.value })} className="w-full border border-slate-200 px-2 py-1.5" style={{ borderRadius: 6 }} />
              </Field>
              <Field label="Phí duy trì/năm (VNĐ)">
                <input type="number" value={form.fee} onChange={e => setForm({ ...form, fee: +e.target.value })} className="w-full border border-slate-200 px-2 py-1.5" style={{ borderRadius: 6 }} />
              </Field>
              <Field label="Ghi chú" full>
                <textarea value={form.note || ""} onChange={e => setForm({ ...form, note: e.target.value })} className="w-full border border-slate-200 px-2 py-1.5" style={{ borderRadius: 6 }} rows={2} />
              </Field>

              {form.platform === "Shopify" && (
                <div className="col-span-2 mt-2 border-t border-slate-200 pt-3">
                  <div className="mb-2 text-xs font-semibold uppercase text-slate-500">Thông tin Shopify</div>
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Ngày đăng ký Shopify">
                      <input type="date" value={form.sfStart || ""} onChange={e => setForm({ ...form, sfStart: e.target.value })} className="w-full border border-slate-200 px-2 py-1.5" style={{ borderRadius: 6 }} />
                    </Field>
                    <Field label="Ngày hết hạn Shopify">
                      <input type="date" value={form.sfEnd || ""} onChange={e => setForm({ ...form, sfEnd: e.target.value })} className="w-full border border-slate-200 px-2 py-1.5" style={{ borderRadius: 6 }} />
                    </Field>
                    <Field label="Trạng thái plan">
                      <select value={form.sfStatus} onChange={e => setForm({ ...form, sfStatus: e.target.value as SfStatus })} className="w-full border border-slate-200 px-2 py-1.5" style={{ borderRadius: 6 }}>
                        <option value="active">Đang chạy</option>
                        <option value="canceled">Đã hủy</option>
                      </select>
                    </Field>
                    <Field label="Gói Shopify">
                      <select value={form.sfPlan || "Basic"} onChange={e => setForm({ ...form, sfPlan: e.target.value })} className="w-full border border-slate-200 px-2 py-1.5" style={{ borderRadius: 6 }}>
                        <option>Basic</option>
                        <option>Shopify</option>
                        <option>Advanced</option>
                      </select>
                    </Field>
                  </div>
                </div>
              )}
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button onClick={() => setModalOpen(false)} className="border border-slate-200 px-4 py-1.5 text-sm hover:bg-slate-50" style={{ borderRadius: 6 }}>Hủy</button>
              <button onClick={save} className="bg-slate-900 px-4 py-1.5 text-sm font-medium text-white hover:bg-slate-700" style={{ borderRadius: 6 }}>Lưu</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function MetricCard({ label, value, valueClass }: { label: string; value: number | string; valueClass?: string }) {
  return (
    <div className="bg-slate-50 px-4 py-3" style={{ borderRadius: 8 }}>
      <div className="text-xs text-slate-500">{label}</div>
      <div className={`mt-1 text-xl font-semibold ${valueClass || "text-slate-900"}`}>{value}</div>
    </div>
  );
}

function Field({ label, children, full }: { label: string; children: React.ReactNode; full?: boolean }) {
  return (
    <div className={full ? "col-span-2" : ""}>
      <label className="mb-1 block text-xs font-medium text-slate-600">{label}</label>
      {children}
    </div>
  );
}
