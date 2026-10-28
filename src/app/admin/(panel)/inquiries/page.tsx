import { readDB } from "@/lib/db";
import { InquiryRow } from "@/components/admin/inquiry";
import { deleteInquiry, setInquiryRead } from "../../actions";

export default async function Inquiries() {
  const { inquiries } = await readDB();
  return (
    <div className="py-10">
      <h1 className="text-3xl font-bold">Inquiries</h1>
      <p className="text-sm text-stone-500">Submissions from the contact form.</p>
      <div className="mt-8 space-y-3">
        {inquiries.map((q) => (
          <InquiryRow key={q.id} q={q} setRead={setInquiryRead} remove={deleteInquiry} />
        ))}
        {!inquiries.length && <p className="rounded-2xl border border-stone-200 bg-white p-8 text-center text-stone-500">No inquiries yet.</p>}
      </div>
    </div>
  );
}
