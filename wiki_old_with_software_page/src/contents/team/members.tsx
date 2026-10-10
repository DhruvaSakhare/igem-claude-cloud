import { useState } from "react";
import { MemberCard, type Member } from "../../components/MemberCard";

// Switch to iGEM URL before deploying:
// const dandelionUrl = "https://static.igem.wiki/teams/6060/wiki/svgs/dandelion2.avif";
const dandelionUrl =
  "https://static.igem.wiki/teams/6060/wiki/svgs/dandelion2.avif";

// Bud positions as % of SVG viewBox (3341 x 2363)
// x, y = top-left corner %, w, h = width/height %
// Mapped alphabetically: index 0 = Member-1, index 1 = Member-2, ...
const BUD_POSITIONS = [
  { x: 56.2, y: 57.5, w: 11.8, h: 17.8 }, // Member-1  → Alisha
  { x: 50.2, y: 53.6, w: 11.2, h: 15.5 }, // Member-2  → Antonio
  { x: 63.1, y: 38.5, w: 8.1, h: 20.4 }, // Member-3  → Daniel
  { x: 53.9, y: 36.5, w: 10.4, h: 17.9 }, // Member-4  → Dhruva
  { x: 42.9, y: 10.9, w: 14.9, h: 21.1 }, // Member-5  → Donatela
  { x: 45.3, y: 25.4, w: 12.6, h: 15.2 }, // Member-6  → Felipe
  { x: 31.8, y: 24.2, w: 14.5, h: 15.3 }, // Member-7  → Frederik
  { x: 30.8, y: 13.8, w: 13.3, h: 11.1 }, // Member-8  → Gunnar
  { x: 24.1, y: 24.9, w: 11.0, h: 12.2 }, // Member-9  → Henrique
  { x: 15.0, y: 32.3, w: 9.6, h: 18.0 }, // Member-10 → Kristine
  { x: 23.1, y: 35.9, w: 9.7, h: 16.0 }, // Member-11 → Lukas
  { x: 17.1, y: 48.5, w: 7.4, h: 17.0 }, // Member-12 → Maria Paula
  { x: 24.9, y: 52.9, w: 10.0, h: 18.1 }, // Member-13 → Pricilla
  { x: 20.8, y: 63.5, w: 10.4, h: 17.6 }, // Member-14 → Ridhima
  { x: 34.9, y: 65.3, w: 12.8, h: 10.2 }, // Member-15 → Sotirios
  { x: 30.6, y: 72.8, w: 13.5, h: 12.0 }, // Member-16 → Weronika
  { x: 43.9, y: 70.6, w: 13.3, h: 12.2 }, // Member-17 → Zoja
];

const SUPERVISOR_POSITIONS = [
  { x: 79.2, y: 10.0, w: 11.0, h: 16.2 }, // Supervisor-1
  { x: 67.4, y: 2.4, w: 13.9, h: 15.3 }, // Supervisor-2
  { x: 67.2, y: 19.8, w: 13.4, h: 18.5 }, // Supervisor-3
  { x: 57.9, y: 11.5, w: 13.3, h: 14.9 }, // Supervisor-4
];

function BudLabel({
  name,
  x,
  y,
  w,
  h,
  color,
  onClick,
}: {
  name: string;
  x: number;
  y: number;
  w: number;
  h: number;
  color: string;
  onClick: (rect: DOMRect) => void;
}) {
  const firstName = name.split(" ")[0];

  return (
    <button
      onMouseEnter={(e) => {
        onClick(e.currentTarget.getBoundingClientRect());
      }}
      onMouseLeave={() => {}}
      style={{
        position: "absolute",
        left: `${x}%`,
        top: `${y}%`,
        width: `${w}%`,
        height: `${h}%`,
        background: "transparent",
        border: "1.5px solid transparent",
        borderRadius: "50%",
        cursor: "pointer",
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
        paddingBottom: "4%",
      }}
    >
      <span
        style={{
          background: `${color}dd`,
          color: "white",
          fontFamily: "Outfit, sans-serif",
          fontSize: "clamp(0.4rem, 1vw, 0.65rem)",
          fontWeight: 700,
          borderRadius: "20px",
          padding: "1px 6px",
          whiteSpace: "nowrap",
          pointerEvents: "none",
        }}
      >
        {firstName}
      </span>
    </button>
  );
}

export function Members() {
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [anchorRect, setAnchorRect] = useState<DOMRect | null>(null);

  const teamMembers: Member[] = [
    {
      name: "Alisha Mahnoor Fatimah Goandal",
      role: "xxx",
      subteam: "Wiki, Team Building, Merch, Safety",
      major: "xxx",
      age: "xxx",
      bio: "xxx",
      igem: "xxx",
      image:
        "https://static.igem.wiki/teams/6060/wiki/placeholders/igem-logo-2500x2500.avif",
      hoverImage:
        "https://static.igem.wiki/teams/6060/wiki/placeholders/igem-logo-2500x2500.avif",
      linkedin: "",
    },
    {
      name: "Antonio Lo Schiavo",
      role: "xxx",
      subteam: "Wiki, Team Building, Merch, Safety",
      major: "xxx",
      age: "xxx",
      bio: "xxx",
      igem: "xxx",
      image:
        "https://static.igem.wiki/teams/6060/wiki/placeholders/igem-logo-2500x2500.avif",
      hoverImage:
        "https://static.igem.wiki/teams/6060/wiki/placeholders/igem-logo-2500x2500.avif",
      linkedin: "",
    },
    {
      name: "Daniel Andreas Hager",
      role: "xxx",
      subteam: "Wiki, Team Building, Merch, Safety",
      major: "xxx",
      age: "xxx",
      bio: "xxx",
      igem: "xxx",
      image:
        "https://static.igem.wiki/teams/6060/wiki/placeholders/igem-logo-2500x2500.avif",
      hoverImage:
        "https://static.igem.wiki/teams/6060/wiki/placeholders/igem-logo-2500x2500.avif",
      linkedin: "",
    },
    {
      name: "Dhruva Gajanan Sakhare",
      role: "xxx",
      subteam: "Wiki, Team Building, Merch, Safety",
      major: "xxx",
      age: "xxx",
      bio: "xxx",
      igem: "xxx",
      image:
        "https://static.igem.wiki/teams/6060/wiki/placeholders/igem-logo-2500x2500.avif",
      hoverImage:
        "https://static.igem.wiki/teams/6060/wiki/placeholders/igem-logo-2500x2500.avif",
      linkedin: "",
    },
    {
      name: "Donatela Palcic",
      role: "xxx",
      subteam: "Wiki, Team Building, Merch, Safety",
      major: "xxx",
      age: "xxx",
      bio: "xxx",
      igem: "xxx",
      image:
        "https://static.igem.wiki/teams/6060/wiki/placeholders/igem-logo-2500x2500.avif",
      hoverImage:
        "https://static.igem.wiki/teams/6060/wiki/placeholders/igem-logo-2500x2500.avif",
      linkedin: "",
    },
    {
      name: "Felipe Campos",
      role: "xxx",
      subteam: "Wiki, Team Building, Merch, Safety",
      major: "xxx",
      age: "xxx",
      bio: "xxx",
      igem: "xxx",
      image:
        "https://static.igem.wiki/teams/6060/wiki/placeholders/igem-logo-2500x2500.avif",
      hoverImage:
        "https://static.igem.wiki/teams/6060/wiki/placeholders/igem-logo-2500x2500.avif",
      linkedin: "",
    },
    {
      name: "Frederik Friis-Petersen",
      role: "xxx",
      subteam: "Wiki, Team Building, Merch, Safety",
      major: "xxx",
      age: "xxx",
      bio: "xxx",
      igem: "xxx",
      image:
        "https://static.igem.wiki/teams/6060/wiki/placeholders/igem-logo-2500x2500.avif",
      hoverImage:
        "https://static.igem.wiki/teams/6060/wiki/placeholders/igem-logo-2500x2500.avif",
      linkedin: "",
    },
    {
      name: "Gunnar Shanafelt",
      role: "xxx",
      subteam: "Wiki, Team Building, Merch, Safety",
      major: "xxx",
      age: "xxx",
      bio: "xxx",
      igem: "xxx",
      image:
        "https://static.igem.wiki/teams/6060/wiki/placeholders/igem-logo-2500x2500.avif",
      hoverImage:
        "https://static.igem.wiki/teams/6060/wiki/placeholders/igem-logo-2500x2500.avif",
      linkedin: "",
    },
    {
      name: "Henrique Noro Frizzo",
      role: "xxx",
      subteam: "Wiki, Team Building, Merch, Safety",
      major: "xxx",
      age: "xxx",
      bio: "xxx",
      igem: "xxx",
      image:
        "https://static.igem.wiki/teams/6060/wiki/placeholders/igem-logo-2500x2500.avif",
      hoverImage:
        "https://static.igem.wiki/teams/6060/wiki/placeholders/igem-logo-2500x2500.avif",
      linkedin: "",
    },
    {
      name: "Kristine Toft Johansen",
      role: "XXX",
      subteam: "Drylab | Wetlab | Wiki | Education | Merch",
      major: "MSc Bioinformatics",
      age: "24",
      bio: "xxx",
      igem: "iGEM Fuel: xxx",
      image:
        "https://static.igem.wiki/teams/6060/wiki/placeholders/igem-logo-2500x2500.avif",
      hoverImage:
        "https://static.igem.wiki/teams/6060/wiki/logos/byebyeblade1-simple.avif",
      linkedin: "https://www.linkedin.com/in/kristine-toft-johansen/",
    },
    {
      name: "Lukas Schieble",
      role: "xxx",
      subteam: "Wiki, Team Building, Merch, Safety",
      major: "xxx",
      age: "xxx",
      bio: "xxx",
      igem: "xxx",
      image:
        "https://static.igem.wiki/teams/6060/wiki/placeholders/igem-logo-2500x2500.avif",
      hoverImage:
        "https://static.igem.wiki/teams/6060/wiki/placeholders/igem-logo-2500x2500.avif",
      linkedin: "",
    },
    {
      name: "Maria Paula Osuna",
      role: "xxx",
      subteam: "Wiki, Team Building, Merch, Safety",
      major: "xxx",
      age: "xxx",
      bio: "xxx",
      igem: "xxx",
      image:
        "https://static.igem.wiki/teams/6060/wiki/placeholders/igem-logo-2500x2500.avif",
      hoverImage:
        "https://static.igem.wiki/teams/6060/wiki/placeholders/igem-logo-2500x2500.avif",
      linkedin: "",
    },
    {
      name: "Pricilla de la Torre",
      role: "xxx",
      subteam: "Wiki, Team Building, Merch, Safety",
      major: "xxx",
      age: "xxx",
      bio: "xxx",
      igem: "xxx",
      image:
        "https://static.igem.wiki/teams/6060/wiki/placeholders/igem-logo-2500x2500.avif",
      hoverImage:
        "https://static.igem.wiki/teams/6060/wiki/placeholders/igem-logo-2500x2500.avif",
      linkedin: "",
    },
    {
      name: "Ridhima Pal",
      role: "xxx",
      subteam: "Wiki, Team Building, Merch, Safety",
      major: "xxx",
      age: "xxx",
      bio: "xxx",
      igem: "xxx",
      image:
        "https://static.igem.wiki/teams/6060/wiki/placeholders/igem-logo-2500x2500.avif",
      hoverImage:
        "https://static.igem.wiki/teams/6060/wiki/placeholders/igem-logo-2500x2500.avif",
      linkedin: "",
    },
    {
      name: "Sotirios Touliopoulos",
      role: "xxx",
      subteam: "Wiki, Team Building, Merch, Safety",
      major: "xxx",
      age: "xxx",
      bio: "xxx",
      igem: "xxx",
      image:
        "https://static.igem.wiki/teams/6060/wiki/placeholders/igem-logo-2500x2500.avif",
      hoverImage:
        "https://static.igem.wiki/teams/6060/wiki/placeholders/igem-logo-2500x2500.avif",
      linkedin: "",
    },
    {
      name: "Weronika Muszyńska",
      role: "xxx",
      subteam: "Wiki, Team Building, Merch, Safety",
      major: "xxx",
      age: "xxx",
      bio: "xxx",
      igem: "xxx",
      image:
        "https://static.igem.wiki/teams/6060/wiki/placeholders/igem-logo-2500x2500.avif",
      hoverImage:
        "https://static.igem.wiki/teams/6060/wiki/placeholders/igem-logo-2500x2500.avif",
      linkedin: "",
    },
    {
      name: "Zoja Palova",
      role: "xxx",
      subteam: "Wiki, Team Building, Merch, Safety",
      major: "xxx",
      age: "xxx",
      bio: "xxx",
      igem: "xxx",
      image:
        "https://static.igem.wiki/teams/6060/wiki/placeholders/igem-logo-2500x2500.avif",
      hoverImage:
        "https://static.igem.wiki/teams/6060/wiki/placeholders/igem-logo-2500x2500.avif",
      linkedin: "",
    },
  ];

  const supervisors: Member[] = [
    {
      name: "Karen",
      role: "Supervisor",
      subteam: "Wetlab",
      major: "PhD Molecular Biology",
      age: "",
      bio: "Prof. Smith leads the synthetic biology research group. Her work focuses on engineering novel biological systems for therapeutic applications.",
      igem: "iGEM Fuel: Strong coffee",
      image:
        "https://static.igem.wiki/teams/6060/wiki/placeholders/igem-logo-2500x2500.avif",
      hoverImage:
        "https://static.igem.wiki/teams/6060/wiki/placeholders/igem-logo-2500x2500.avif",
      linkedin: "",
    },
    {
      name: "Kristian",
      role: "Supervisor",
      subteam: "General",
      major: "PhD Bioinformatics",
      age: "",
      bio: "Dr. Hansen advises the team on computational modeling and data analysis pipelines.",
      igem: "iGEM Fuel: Oat milk latte",
      image:
        "https://static.igem.wiki/teams/6060/wiki/placeholders/igem-logo-2500x2500.avif",
      hoverImage:
        "https://static.igem.wiki/teams/6060/wiki/placeholders/igem-logo-2500x2500.avif",
      linkedin: "",
    },
    {
      name: "Aitor",
      role: "Supervisor",
      subteam: "Drylab",
      major: "MSc Biochemistry",
      age: "26",
      bio: "Alex focuses on the experimental side of the project, designing and running assays in the lab.",
      igem: "iGEM Fuel: Instant noodles",
      image:
        "https://static.igem.wiki/teams/6060/wiki/placeholders/igem-logo-2500x2500.avif",
      hoverImage:
        "https://static.igem.wiki/teams/6060/wiki/placeholders/igem-logo-2500x2500.avif",
      linkedin: "",
    },
    {
      name: "Signe",
      role: "Supervisor",
      subteam: "Wetlab | Merch",
      major: "",
      age: "",
      bio: "",
      igem: "",
      image:
        "https://static.igem.wiki/teams/6060/wiki/placeholders/igem-logo-2500x2500.avif",
      hoverImage:
        "https://static.igem.wiki/teams/6060/wiki/placeholders/igem-logo-2500x2500.avif",
      linkedin: "",
    },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700;800&display=swap');
      `}</style>

      <div
        style={{
          width: "100%",
          padding: "0",
          boxSizing: "border-box",
          backgroundColor: "#b0e6ff",
        }}
      >
        {/* Aspect-ratio container for the dandelion (SVG viewBox 2481 × 3508) */}
        <div
          style={{
            position: "relative",
            width: "100%",
            paddingBottom: "70.7%",
          }}
        >
          <img
            src={dandelionUrl}
            alt="DTU BioBuilders dandelion"
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              display: "block",
            }}
          />

          {/* Team member bud labels */}
          {teamMembers.map((member, i) => (
            <BudLabel
              key={member.name}
              name={member.name}
              x={BUD_POSITIONS[i].x}
              y={BUD_POSITIONS[i].y}
              w={BUD_POSITIONS[i].w}
              h={BUD_POSITIONS[i].h}
              color="#1B5A9D"
              onClick={(rect) => {
                setSelectedMember(member);
                setAnchorRect(rect);
              }}
            />
          ))}

          {/* Supervisor bud labels */}
          {supervisors.map((member, i) => (
            <BudLabel
              key={member.name}
              name={member.name}
              x={SUPERVISOR_POSITIONS[i].x}
              y={SUPERVISOR_POSITIONS[i].y}
              w={SUPERVISOR_POSITIONS[i].w}
              h={SUPERVISOR_POSITIONS[i].h}
              color="#F29807"
              onClick={(rect) => {
                setSelectedMember(member);
                setAnchorRect(rect);
              }}
            />
          ))}
        </div>
      </div>

      {selectedMember && anchorRect && (
        <MemberCard
          member={selectedMember}
          anchorRect={anchorRect}
          onClose={() => setSelectedMember(null)}
        />
      )}
    </>
  );
}
