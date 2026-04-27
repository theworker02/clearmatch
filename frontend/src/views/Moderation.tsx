import { useEffect, useState } from "react";
import { AdminReport, useApp } from "../state";

export function Moderation() {
  const { api } = useApp();
  const [reports, setReports] = useState<AdminReport[]>([]);
  useEffect(() => { api<AdminReport[]>("/admin/reports").then(setReports); }, []);
  return (
    <section className="pageStack">
      <header className="pageHeader"><h1>Moderation queue</h1><p>Basic admin surface for report triage.</p></header>
      <div className="listPanel">
        {reports.length ? reports.map((report) => (
          <article className="listItem tall" key={report.id}>
            <span>{report.reason}</span>
            <small>{report.reporter} reported {report.reported} · {report.status}</small>
            <p>{report.details}</p>
          </article>
        )) : <p>No reports are currently open.</p>}
      </div>
    </section>
  );
}
