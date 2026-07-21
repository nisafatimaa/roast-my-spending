"use client";
import { useState, useRef, useEffect } from "react";

type Msg = { role: "user" | "granny"; text: string };

export default function Home() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Msg[]>([
    {
      role: "granny",
      text: "Well hello dearie, pull up a chair and tell me what you've been wasting your money on this time.",
    },
  ]);
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function handleSend() {
    const expenses = input.trim();
    if (!expenses || loading) return;

    setMessages((m) => [...m, { role: "user", text: expenses }]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/roast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ expenses }),
      });
      const data = await res.json();
      if (data.error) {
        setMessages((m) => [...m, { role: "granny", text: data.error }]);
      } else {
        const extra =
          data.guilt_score === -1
            ? `\n\n${data.honest_tip}`
            : `\n\nGuilt-o-meter: ${data.guilt_score}/10\nGranny's real advice: ${data.honest_tip}`;
        setMessages((m) => [...m, { role: "granny", text: `${data.roast}${extra}` }]);
      }
    } catch {
      setMessages((m) => [...m, { role: "granny", text: "Oh bother, something broke. Try again." }]);
    }
    setLoading(false);
  }

  return (
    <div className="page">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Caveat:wght@600;700&family=Nunito:wght@400;600;700&display=swap');

        * { box-sizing: border-box; }

        .page {
          min-height: 100vh;
          background: #F7F0E1;
          background-image:
            radial-gradient(circle at 15% 20%, rgba(201,124,139,0.10) 0, transparent 45%),
            radial-gradient(circle at 85% 80%, rgba(138,155,110,0.10) 0, transparent 45%);
          display: flex;
          flex-direction: column;
          font-family: 'Nunito', sans-serif;
          color: #5C4033;
        }

        .header {
          padding: 18px 20px 14px;
          background: #C97C8B;
          color: #FFF7EE;
          display: flex;
          align-items: center;
          gap: 12px;
          box-shadow: 0 2px 8px rgba(92,64,51,0.15);
        }

        .avatar {
          width: 46px;
          height: 46px;
          border-radius: 50%;
          background: #F7F0E1;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 22px;
          flex-shrink: 0;
          animation: rock 3.2s ease-in-out infinite;
          transform-origin: bottom center;
        }

        @keyframes rock {
          0%, 100% { transform: rotate(-4deg); }
          50% { transform: rotate(4deg); }
        }

        .header-text h1 {
          font-family: 'Caveat', cursive;
          font-size: 26px;
          font-weight: 700;
          margin: 0;
          line-height: 1;
        }

        .header-text p {
          font-size: 12px;
          margin: 2px 0 0;
          opacity: 0.9;
        }

        .thread {
          flex: 1;
          padding: 20px 16px 8px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          max-width: 640px;
          width: 100%;
          margin: 0 auto;
        }

        .bubble-row {
          display: flex;
          gap: 8px;
          align-items: flex-end;
          animation: pop-in 0.25s ease;
        }

        @keyframes pop-in {
          from { opacity: 0; transform: translateY(8px) scale(0.97); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }

        .bubble-row.user { justify-content: flex-end; }

        .mini-avatar {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: #C97C8B;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          flex-shrink: 0;
        }

        .bubble {
          max-width: 75%;
          padding: 10px 14px;
          border-radius: 18px;
          font-size: 16px;
          line-height: 1.4;
        }

        .bubble.granny {
          background: #FFFFFF;
          border: 1px solid rgba(201,124,139,0.25);
          border-bottom-left-radius: 4px;
          font-family: 'Caveat', cursive;
          font-size: 20px;
          font-weight: 600;
          color: #5C4033;
          white-space: pre-wrap;
        }

        .bubble.user {
          background: #8A9B6E;
          color: #FFF9EE;
          border-bottom-right-radius: 4px;
        }

        .typing-row {
          display: flex;
          gap: 8px;
          align-items: center;
        }

        .typing-bubble {
          background: #FFFFFF;
          border: 1px solid rgba(201,124,139,0.25);
          border-bottom-left-radius: 4px;
          border-radius: 18px;
          padding: 12px 16px;
          display: flex;
          gap: 5px;
        }

        .yarn-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #E8B84B;
          animation: bounce 1s infinite ease-in-out;
        }
        .yarn-dot:nth-child(2) { animation-delay: 0.15s; background: #C97C8B; }
        .yarn-dot:nth-child(3) { animation-delay: 0.3s; background: #8A9B6E; }

        @keyframes bounce {
          0%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-6px); }
        }

        .input-bar {
          display: flex;
          gap: 10px;
          padding: 14px 16px;
          background: #FFF9EE;
          border-top: 1px solid rgba(201,124,139,0.2);
          max-width: 640px;
          width: 100%;
          margin: 0 auto;
        }

        .input-bar textarea {
          flex: 1;
          resize: none;
          border: 2px solid rgba(201,124,139,0.3);
          border-radius: 20px;
          padding: 10px 16px;
          font-family: 'Nunito', sans-serif;
          font-size: 15px;
          color: #5C4033;
          background: #FFFFFF;
          outline: none;
          max-height: 100px;
        }

        .input-bar textarea:focus {
          border-color: #C97C8B;
        }

        .send-btn {
          background: #E8B84B;
          color: #5C4033;
          border: none;
          border-radius: 50%;
          width: 44px;
          height: 44px;
          flex-shrink: 0;
          font-size: 18px;
          cursor: pointer;
          transition: transform 0.15s ease;
        }

        .send-btn:hover:not(:disabled) { transform: scale(1.08); }
        .send-btn:disabled { opacity: 0.5; cursor: not-allowed; }

        @media (prefers-reduced-motion: reduce) {
          .avatar, .bubble-row, .yarn-dot, .send-btn { animation: none !important; transition: none !important; }
        }
      `}</style>

      <div className="header">
        <div className="avatar">🧶</div>
        <div className="header-text">
          <h1>Granny Roasts</h1>
          <p>she's seen your bank statement</p>
        </div>
      </div>

      <div className="thread">
        {messages.map((m, i) => (
          <div key={i} className={`bubble-row ${m.role}`}>
            {m.role === "granny" && <div className="mini-avatar">👵</div>}
            <div className={`bubble ${m.role}`}>{m.text}</div>
          </div>
        ))}

        {loading && (
          <div className="bubble-row granny typing-row">
            <div className="mini-avatar">👵</div>
            <div className="typing-bubble">
              <span className="yarn-dot" />
              <span className="yarn-dot" />
              <span className="yarn-dot" />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="input-bar">
        <textarea
          rows={1}
          placeholder="tell granny what you bought..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
        />
        <button className="send-btn" onClick={handleSend} disabled={loading}>
          ➤
        </button>
      </div>
    </div>
  );
}