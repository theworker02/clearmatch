import { ArrowLeft, ArrowRight, CheckCircle2, Sparkles } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { PromptQuestion } from "../../../shared/types";
import { useApp } from "../state";

type AnswerValue = string | number | boolean | string[];

const categoryLabels: Record<string, string> = {
  personality: "Personality",
  dating_intentions: "Dating intentions",
  communication: "Communication",
  lifestyle: "Lifestyle",
  values: "Values"
};

export function PersonalityTest() {
  const { api } = useApp();
  const navigate = useNavigate();
  const [questions, setQuestions] = useState<PromptQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<string, AnswerValue>>({});
  const [index, setIndex] = useState(0);
  const [status, setStatus] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api<PromptQuestion[]>("/personality-test").then(setQuestions);
  }, []);

  const question = questions[index];
  const answeredCount = useMemo(() => questions.filter((item) => {
    const answer = answers[item.id];
    return Array.isArray(answer) ? answer.length > 0 : answer !== undefined && answer !== "";
  }).length, [answers, questions]);
  const progress = questions.length ? Math.round((answeredCount / questions.length) * 100) : 0;

  function setAnswer(questionId: string, value: AnswerValue) {
    setAnswers((current) => ({ ...current, [questionId]: value }));
    setStatus("");
  }

  function toggleRanked(questionId: string, option: string) {
    const current = Array.isArray(answers[questionId]) ? answers[questionId] as string[] : [];
    setAnswer(questionId, current.includes(option) ? current.filter((item) => item !== option) : [...current, option]);
  }

  async function saveAndContinue() {
    const missing = questions.find((item) => {
      const answer = answers[item.id];
      return Array.isArray(answer) ? !answer.length : answer === undefined || answer === "";
    });
    if (missing) {
      setStatus("Answer each question so your first recommendations have enough signal.");
      setIndex(Math.max(0, questions.findIndex((item) => item.id === missing.id)));
      return;
    }
    setSaving(true);
    try {
      await api("/personality-test", {
        method: "POST",
        body: JSON.stringify({ answers: Object.entries(answers).map(([questionId, value]) => ({ questionId, value })) })
      });
      navigate("/setup-profile");
    } catch (caught) {
      setStatus(caught instanceof Error ? caught.message : "Could not save personality test.");
    } finally {
      setSaving(false);
    }
  }

  if (!question) {
    return <div className="emptyState"><h1>Loading personality test</h1><p>Preparing the deeper matching questions.</p></div>;
  }

  return (
    <section className="pageStack personalityTest">
      <header className="pageHeader centeredHeader">
        <span className="eyebrow"><Sparkles size={16} /> First-run match signal</span>
        <h1>Personality test</h1>
        <p>Your answers help ClearMatch understand emotional rhythm, communication style, intent, and values before your first recommendations.</p>
      </header>

      <div className="testProgress">
        <header><span>{answeredCount} of {questions.length} answered</span><span>{progress}%</span></header>
        <div className="progressTrack"><div className="progressFill" style={{ width: `${progress}%` }} /></div>
      </div>

      <article className="panel questionCard routeTransition" key={question.id}>
        <span className="questionMeta">{categoryLabels[question.category] || question.category}</span>
        <h2>{question.question}</h2>

        {question.type === "short_answer" && (
          <textarea
            className="largeAnswer"
            value={String(answers[question.id] || "")}
            onChange={(event) => setAnswer(question.id, event.target.value)}
            placeholder="Answer naturally. A sentence or two is enough."
          />
        )}

        {question.type === "multiple_choice" && (
          <div className="choiceGrid">
            {question.options?.map((option) => (
              <button className={answers[question.id] === option ? "selected" : ""} key={option} type="button" onClick={() => setAnswer(question.id, option)}>
                {option}
              </button>
            ))}
          </div>
        )}

        {question.type === "slider" && (
          <label className="sliderQuestion">
            <input type="range" min={1} max={10} value={Number(answers[question.id] || 5)} onChange={(event) => setAnswer(question.id, Number(event.target.value))} />
            <span className="rangeLabels">{question.minLabel}<strong>{answers[question.id] || 5}</strong>{question.maxLabel}</span>
          </label>
        )}

        {question.type === "yes_no" && (
          <div className="choiceGrid twoChoices">
            <button className={answers[question.id] === true ? "selected" : ""} type="button" onClick={() => setAnswer(question.id, true)}>Yes</button>
            <button className={answers[question.id] === false ? "selected" : ""} type="button" onClick={() => setAnswer(question.id, false)}>No</button>
          </div>
        )}

        {question.type === "ranked_preference" && (
          <div className="choiceGrid">
            {question.options?.map((option) => {
              const current = Array.isArray(answers[question.id]) ? answers[question.id] as string[] : [];
              return (
                <button className={current.includes(option) ? "selected" : ""} key={option} type="button" onClick={() => toggleRanked(question.id, option)}>
                  {current.includes(option) ? `${current.indexOf(option) + 1}. ` : ""}{option}
                </button>
              );
            })}
          </div>
        )}
      </article>

      {status && <p className="formError">{status}</p>}

      <div className="wizardActions">
        <button className="secondaryButton" type="button" disabled={index === 0} onClick={() => setIndex((current) => Math.max(0, current - 1))}><ArrowLeft size={18} />Back</button>
        {index < questions.length - 1 ? (
          <button className="primaryButton" type="button" onClick={() => setIndex((current) => Math.min(questions.length - 1, current + 1))}>Next<ArrowRight size={18} /></button>
        ) : (
          <button className="primaryButton" type="button" disabled={saving} onClick={saveAndContinue}><CheckCircle2 size={18} />{saving ? "Saving..." : "Save and continue"}</button>
        )}
      </div>
    </section>
  );
}
