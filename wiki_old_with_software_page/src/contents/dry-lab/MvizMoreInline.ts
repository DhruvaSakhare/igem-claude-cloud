import { createContext } from "react";

/* ========================================================================== *
 *  MvizMoreInline — how a method card's "More about this method" panel opens
 *
 *  Set true around a group of illustration cards to render each card's `more`
 *  panel OPEN AND WITHOUT ITS TOGGLE, as plain text at the bottom of the card.
 *  Default false, so the Methods page and every other card are untouched.
 *
 *  It exists for ChannelMethodsBox, which the Discovery page renders twice: the
 *  box is itself a disclosure, so a reader who opens it has already asked for
 *  the detail, and making them open three more disclosures inside it to reach
 *  the write-up is one layer too many. Both copies of the box set it; the
 *  Methods page, where each card stands on its own rather than inside a box
 *  the reader has just opened, does not, and keeps its toggles.
 *
 *  A context rather than a prop because the cards sit several components below
 *  the box (ChannelMethodsBox → MethodBlock → FpocketVizV2 → MvizInfo), and
 *  nothing in between has any business knowing about this.
 *
 *  Its own file because react-refresh wants contexts kept out of files that
 *  export components — and because both model_methods.tsx (which reads it, in
 *  MvizInfo) and ChannelMethodsBox.tsx (which provides it) need it.
 * ========================================================================== */
export const MvizMoreInline = createContext(false);
