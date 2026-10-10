/* ========================================================================== *
 *  Where the channel-discovery figures are uploaded
 *
 *  Its own module, holding one constant, for the reason given on citations.ts
 *  and MvizMoreInline.ts: a constant exported from a file that also exports
 *  components trips react-refresh/only-export-components, and both the figure
 *  component (ChannelFigures.tsx) and the pages that derive further paths from
 *  this base need to read it.
 *
 *  The per-structure tunnel plots sit at `<CHANNEL_BASE>/<slug>/…`, where the
 *  slug is USUALLY the structure's id in structures.ts — but not always, the
 *  same caveat MdFigures.tsx carries. The RFdiffusion designs are the current
 *  exception: their 3D files are under the full run name and their plots under
 *  the short one (see DESIGN_MD_SLUGS in model_engineering.tsx, which the
 *  channel plots reuse). Check the upload rather than assuming.
 * ========================================================================== */

export const CHANNEL_BASE =
  "https://static.igem.wiki/teams/6060/wiki/drylab/channel-discovery";
