"use client";

import { Download, Loader2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { instance } from "@/helpers/axios/axiosInstance";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { getApiErrorMessage } from "@/lib/errors";
import { useT } from "@/lib/i18n/useT";
import type { TPublicExam } from "@/lib/publicSite";

type TMode = "roll_dob" | "roll_only" | "student_id_dob";
type TPayload = {
  school: string;
  exam: string;
  student: { name: string; studentId: string; class?: string; section?: string; roll: number };
  subjects: { name: string; fullMarks: number; obtained: number; grade?: string; point?: number; passed: boolean }[];
  totalMarks: number;
  fullMarks: number;
  percent: number;
  gpa?: number;
  letter?: string;
  passed: boolean;
};

const baseURL = process.env.NEXT_PUBLIC_BACKEND_API_URL ?? "/api/v1";

export function ResultLookup({ slug, mode, exams }: { slug: string; mode: TMode; exams: TPublicExam[] }) {
  const { t } = useT();
  const [examId, setExamId] = useState(exams[0]?.id ?? "");
  const [classId, setClassId] = useState(exams[0]?.classes[0]?.id ?? "");
  const [roll, setRoll] = useState("");
  const [studentId, setStudentId] = useState("");
  const [dob, setDob] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<TPayload | null>(null);
  const { handleSubmit } = useForm();
  const classes = exams.find((e) => e.id === examId)?.classes ?? [];

  const body = () =>
    mode === "student_id_dob" ? { examId, studentId, dob } : mode === "roll_only" ? { examId, classId, roll: Number(roll) } : { examId, classId, roll: Number(roll), dob };

  const onSubmit = handleSubmit(async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const url = `${baseURL}/public/schools/${slug}/results/lookup`;
      const res = (await instance.post(url, body())) as unknown as { data: TPayload };
      setResult(res.data);
    } catch (err) {
      setError(getApiErrorMessage(err, t));
    } finally {
      setLoading(false);
    }
  });

  const downloadMarksheet = async () => {
    const url = `${baseURL}/public/schools/${slug}/results/marksheet`;
    const res = (await instance.post(url, body(), { responseType: "blob" })) as unknown as { data: Blob };
    const href = URL.createObjectURL(res.data);
    const a = document.createElement("a");
    a.href = href;
    a.download = "marksheet.pdf";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(href);
  };

  return (
    <div className="max-w-md space-y-6">
      <form onSubmit={onSubmit} noValidate className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="rl-exam">Exam</Label>
          <Select id="rl-exam" value={examId} onChange={(e) => { setExamId(e.target.value); setClassId(""); }}>
            {exams.map((ex) => (
              <option key={ex.id} value={ex.id}>{ex.name}</option>
            ))}
          </Select>
        </div>
        {mode !== "student_id_dob" ? (
          <div className="space-y-1.5">
            <Label htmlFor="rl-class">Class</Label>
            <Select id="rl-class" value={classId} onChange={(e) => setClassId(e.target.value)}>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </Select>
          </div>
        ) : null}
        {mode === "student_id_dob" ? (
          <div className="space-y-1.5">
            <Label htmlFor="rl-sid">Student ID</Label>
            <Input id="rl-sid" value={studentId} onChange={(e) => setStudentId(e.target.value)} required />
          </div>
        ) : (
          <div className="space-y-1.5">
            <Label htmlFor="rl-roll">Roll</Label>
            <Input id="rl-roll" inputMode="numeric" value={roll} onChange={(e) => setRoll(e.target.value)} required />
          </div>
        )}
        {mode !== "roll_only" ? (
          <div className="space-y-1.5">
            <Label htmlFor="rl-dob">Date of birth</Label>
            <Input id="rl-dob" type="date" value={dob} onChange={(e) => setDob(e.target.value)} required />
          </div>
        ) : null}
        {error ? <p role="alert" className="text-sm text-destructive">{error}</p> : null}
        <Button type="submit" disabled={loading}>
          {loading ? <Loader2 className="animate-spin" aria-hidden="true" /> : null}
          Find result
        </Button>
      </form>

      {result ? (
        <div className="rounded-xl border border-border p-4">
          <p className="font-semibold text-navy">{result.student.name} · {result.student.studentId}</p>
          <p className="text-sm text-muted-foreground">{result.exam} · {result.student.class} {result.student.section}</p>
          <table className="mt-3 w-full text-sm">
            <tbody>
              {result.subjects.map((s, i) => (
                <tr key={i} className="border-b border-border/60">
                  <td className="py-1">{s.name}</td>
                  <td className="tabular py-1 text-right">{s.obtained}/{s.fullMarks}</td>
                  <td className="py-1 text-right">{s.grade ?? "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="mt-2 font-semibold text-navy">
            {result.totalMarks}/{result.fullMarks} {result.gpa ? `· GPA ${result.gpa}` : ""} {result.letter ? `· ${result.letter}` : ""} · {result.passed ? "Passed" : "Failed"}
          </p>
          <Button variant="outline" className="mt-3" onClick={downloadMarksheet}>
            <Download aria-hidden="true" />
            Download marksheet
          </Button>
        </div>
      ) : null}
    </div>
  );
}
