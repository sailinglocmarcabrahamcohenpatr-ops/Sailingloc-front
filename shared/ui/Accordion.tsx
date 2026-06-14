"use client";

import { useState } from "react";
import type { FaqItem } from "@/shared/types";

interface AccordionProps {
  items: FaqItem[];
}

export default function Accordion({ items }: AccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (i: number) => setOpenIndex(openIndex === i ? null : i);

  return (
    <div>
      {items.map((item, i) => (
        <div key={i} className="accordion-item">
          <button
            className={`accordion-btn${openIndex === i ? " open" : ""}`}
            onClick={() => toggle(i)}
            aria-expanded={openIndex === i}
          >
            {item.question}
            <i className="fa-solid fa-chevron-down" aria-hidden="true" />
          </button>
          <div className={`accordion-body${openIndex === i ? " open" : ""}`}>
            <p>{item.answer}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
