"use client";

import { useEffect, useRef, useState } from "react";
import type { TypeEquipementAPI } from "@/shared/lib/referentiels-api";

type Props = {
  typesEquipements: TypeEquipementAPI[];
  selectedIds: Set<number>;
  onToggle: (equipementId: number, checked: boolean) => void;
  emptyLabel: string;
};

/** Sélecteur d'équipements : un accordéon par catégorie, des chips à cocher à l'intérieur. */
export default function EquipementsPicker({ typesEquipements, selectedIds, onToggle, emptyLabel }: Props) {
  const [openTypeIds, setOpenTypeIds] = useState<Set<number>>(new Set());
  const initialized = useRef(false);

  /* Ouvre par défaut les catégories qui ont déjà une sélection (utile en édition), sinon
   * la première catégorie — une seule fois au chargement des types, sans écraser les
   * toggles manuels ensuite. */
  useEffect(() => {
    if (initialized.current || typesEquipements.length === 0) return;
    initialized.current = true;
    const withSelection = typesEquipements
      .filter((type) => (type.equipements ?? []).some((eq) => selectedIds.has(eq.id)))
      .map((type) => type.id);
    setOpenTypeIds(new Set(withSelection.length > 0 ? withSelection : [typesEquipements[0].id]));
  }, [typesEquipements, selectedIds]);

  function toggleType(id: number) {
    setOpenTypeIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  if (typesEquipements.length === 0) {
    return <p className="form-hint">{emptyLabel}</p>;
  }

  return (
    <div className="equip-picker">
      {typesEquipements.map((type) => {
        const items = type.equipements ?? [];
        if (items.length === 0) return null;
        const isOpen = openTypeIds.has(type.id);
        const checkedCount = items.filter((eq) => selectedIds.has(eq.id)).length;
        const bodyId = `equip-type-${type.id}`;
        return (
          <div className="equip-picker-section" key={type.id}>
            <button
              type="button"
              className="equip-picker-trigger"
              onClick={() => toggleType(type.id)}
              aria-expanded={isOpen}
              aria-controls={bodyId}
            >
              <span className="equip-picker-trigger-label">{type.labelTypeEquipement}</span>
              <span className="equip-picker-trigger-end">
                {checkedCount > 0 && <span className="equip-picker-count">{checkedCount}</span>}
                <i className={`fa-solid fa-chevron-down equip-picker-chevron${isOpen ? " open" : ""}`} aria-hidden="true" />
              </span>
            </button>
            <div id={bodyId} className={`equip-picker-body${isOpen ? " open" : ""}`}>
              <div className="equip-picker-chips">
                {items.map((eq) => {
                  const active = selectedIds.has(eq.id);
                  return (
                    <button
                      key={eq.id}
                      type="button"
                      className={`chip equip-chip${active ? " active" : ""}`}
                      aria-pressed={active}
                      onClick={() => onToggle(eq.id, !active)}
                    >
                      {eq.icone && <i className={`fa-solid ${eq.icone}`} aria-hidden="true" />}
                      {eq.nom}
                      {active && (
                        <span className="equip-chip-check">
                          <i className="fa-solid fa-check" aria-hidden="true" />
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
