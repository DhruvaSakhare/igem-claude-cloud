import { useState, useEffect } from "react";

export type Member = {
  name: string;
  role: string;
  subteam: string;
  major: string;
  age: string;
  bio: string;
  igem: string;
  image: string;
  hoverImage: string;
  linkedin: string;
};

type MemberCardProps = {
  member: Member;
  anchorRect: DOMRect;
  onClose: () => void;
};

export function MemberCard({ member, anchorRect, onClose }: MemberCardProps) {
  const cardW = 256;
  const cardH = 384;
  const margin = 12;
  const vpW = window.innerWidth;
  const vpH = window.innerHeight;
  const budCx = anchorRect.left + anchorRect.width / 2;
  const budCy = anchorRect.top + anchorRect.height / 2;
  let left = budCx - cardW / 2;
  let top = budCy - cardH / 2;
  left = Math.max(margin, Math.min(left, vpW - cardW - margin));
  top = Math.max(margin, Math.min(top, vpH - cardH - margin));
  const [flipped, setFlipped] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const t1 = requestAnimationFrame(() => setMounted(true));
    const t2 = setTimeout(() => setFlipped(true), 80);
    return () => {
      cancelAnimationFrame(t1);
      clearTimeout(t2);
    };
  }, []);

  const handleClose = () => {
    setFlipped(false);
    setTimeout(onClose, 600);
  };

  const igEmFuelValue = member.igem.includes(": ")
    ? member.igem.split(": ").slice(1).join(": ")
    : member.igem;

  return (
    <div
      onMouseLeave={handleClose}
      style={{
        position: "fixed",
        left: `${left}px`,
        top: `${top}px`,
        width: `${cardW}px`,
        height: `${cardH}px`,
        zIndex: 1000,
        opacity: mounted ? 1 : 0,
        transition: "opacity 0.2s ease",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "256px",
          height: "384px",
          perspective: "1200px",
          cursor: "default",
          transform: `scale(${mounted ? 1 : 0.4})`,
          transition: "transform 0.5s cubic-bezier(.4,0,.2,1)",
        }}
      >
        <div
          style={{
            position: "relative",
            width: "100%",
            height: "100%",
            transformStyle: "preserve-3d",
            transition: "transform 0.6s cubic-bezier(.4,0,.2,1)",
            transform: flipped ? "rotateY(0deg)" : "rotateY(180deg)",
          }}
        >
          {/* Card Back */}
          <div
            style={{
              position: "absolute",
              width: "100%",
              height: "100%",
              backfaceVisibility: "hidden",
              WebkitBackfaceVisibility: "hidden",
              transform: "rotateY(180deg)",
              borderRadius: "20px",
              background:
                "linear-gradient(135deg, bg.lightblue 0%, #374D82 60%, #1a2d5a 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 24px 64px rgba(0,0,0,0.5)",
              border: "2px solid rgba(242,152,7,0.4)",
            }}
          >
            <img
              src="https://static.igem.wiki/teams/6060/wiki/placeholders/igem-logo-2500x2500.avif"
              alt="Team Logo"
              style={{ width: "55%", borderRadius: "12px", opacity: 0.9 }}
            />
          </div>

          {/* Card Front */}
          <div
            style={{
              position: "absolute",
              width: "100%",
              height: "100%",
              backfaceVisibility: "hidden",
              WebkitBackfaceVisibility: "hidden",
              borderRadius: "20px",
              background:
                "linear-gradient(160deg, #1a3a6b 0%, #1B5A9D 35%, #374D82 100%)",
              boxShadow: "0 24px 64px rgba(0,0,0,0.5)",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
              border: "2px solid rgba(242,152,7,0.5)",
            }}
          >
            {/* Orange top accent line */}
            <div
              style={{
                height: "4px",
                background: "linear-gradient(90deg, #F29807, #f5b942)",
                flexShrink: 0,
              }}
            />

            {/* Photo */}
            <div
              style={{ position: "relative", height: "155px", flexShrink: 0 }}
            >
              <img
                src={member.image}
                alt={member.name}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
              {/* Gradient fade from photo into card */}
              <div
                style={{
                  position: "absolute",
                  bottom: 0,
                  left: 0,
                  right: 0,
                  height: "70px",
                  background: "linear-gradient(transparent, #1B5A9D)",
                }}
              />
            </div>

            {/* Content */}
            <div
              style={{
                padding: "0.7rem 1rem 0.9rem",
                flex: 1,
                display: "flex",
                flexDirection: "column",
                gap: "0.35rem",
                overflow: "hidden",
              }}
            >
              {/* Name + LinkedIn */}
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "0.4rem",
                }}
              >
                <div
                  style={{
                    color: "white",
                    fontFamily: "Outfit, sans-serif",
                    fontSize: "1rem",
                    fontWeight: 800,
                    flex: 1,
                    lineHeight: 1.2,
                  }}
                >
                  {member.name}
                </div>
                {member.linkedin && member.linkedin.trim() !== "" && (
                  <a
                    href={member.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    style={{ flexShrink: 0, marginTop: "2px" }}
                  >
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="rgba(255,255,255,0.7)"
                      style={{ display: "block", transition: "fill 0.2s" }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.fill = "#F29807")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.fill = "rgba(255,255,255,0.7)")
                      }
                    >
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                    </svg>
                  </a>
                )}
              </div>

              {/* Role */}
              <div
                style={{
                  color: "#F29807",
                  fontFamily: "Outfit, sans-serif",
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  letterSpacing: "0.02em",
                }}
              >
                {member.role}
              </div>

              {/* Subteam */}
              <div
                style={{
                  color: "rgba(255,255,255,0.6)",
                  fontFamily: "Outfit, sans-serif",
                  fontSize: "0.65rem",
                  fontWeight: 500,
                }}
              >
                {member.subteam}
              </div>

              <div
                style={{
                  borderTop: "1px solid rgba(255,255,255,0.15)",
                  margin: "0.1rem 0",
                }}
              />

              {/* Major + Age */}
              <div style={{ display: "flex", gap: "1.2rem" }}>
                {member.major && member.major !== "xxx" && (
                  <div>
                    <div
                      style={{
                        color: "rgba(255,255,255,0.4)",
                        fontFamily: "Outfit, sans-serif",
                        fontSize: "0.55rem",
                        fontWeight: 700,
                        textTransform: "uppercase",
                        letterSpacing: "0.08em",
                      }}
                    >
                      Major
                    </div>
                    <div
                      style={{
                        color: "white",
                        fontFamily: "Outfit, sans-serif",
                        fontSize: "0.7rem",
                        fontWeight: 600,
                      }}
                    >
                      {member.major}
                    </div>
                  </div>
                )}
                {member.age && member.age !== "xxx" && (
                  <div>
                    <div
                      style={{
                        color: "rgba(255,255,255,0.4)",
                        fontFamily: "Outfit, sans-serif",
                        fontSize: "0.55rem",
                        fontWeight: 700,
                        textTransform: "uppercase",
                        letterSpacing: "0.08em",
                      }}
                    >
                      Age
                    </div>
                    <div
                      style={{
                        color: "white",
                        fontFamily: "Outfit, sans-serif",
                        fontSize: "0.7rem",
                        fontWeight: 600,
                      }}
                    >
                      {member.age}
                    </div>
                  </div>
                )}
              </div>

              {/* Bio */}
              {member.bio && member.bio !== "xxx" && (
                <div
                  style={{
                    color: "rgba(255,255,255,0.8)",
                    fontFamily: "Outfit, sans-serif",
                    fontSize: "0.68rem",
                    lineHeight: 1.55,
                    overflow: "hidden",
                    display: "-webkit-box",
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: "vertical" as const,
                  }}
                >
                  {member.bio}
                </div>
              )}

              {/* iGEM Fuel */}
              {igEmFuelValue && igEmFuelValue !== "xxx" && (
                <div
                  style={{
                    marginTop: "auto",
                    padding: "0.3rem 0.65rem",
                    background: "rgba(242,152,7,0.15)",
                    borderRadius: "8px",
                    border: "1px solid rgba(242,152,7,0.35)",
                  }}
                >
                  <span
                    style={{
                      color: "#F29807",
                      fontFamily: "Outfit, sans-serif",
                      fontSize: "0.62rem",
                      fontWeight: 700,
                    }}
                  >
                    iGEM Fuel:{" "}
                  </span>
                  <span
                    style={{
                      color: "rgba(255,255,255,0.85)",
                      fontFamily: "Outfit, sans-serif",
                      fontSize: "0.62rem",
                    }}
                  >
                    {igEmFuelValue}
                  </span>
                </div>
              )}
            </div>

            {/* Orange bottom accent line */}
            <div
              style={{
                height: "4px",
                background: "linear-gradient(90deg, #f5b942, #F29807)",
                flexShrink: 0,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
