import pages from "../pages.ts";
import type { Subpage } from "../components/SubpageCards";

type Folder = {
  path?: string;
  cardTitle?: string;
  name?: string;
  illustration?: {
    img: string;
    box?: Subpage["box"];
    aspect?: Subpage["aspect"];
  };
}[];

/** A section's subpages as header cards, optionally leaving one page out. */
function toCards(folder: Folder, exclude?: string): Subpage[] {
  return folder
    .filter((sub) => sub.path && sub.path !== exclude)
    .map((sub) => ({
      to: sub.path as string,
      title: sub.cardTitle ?? sub.name ?? "",
      img: sub.illustration?.img,
      box: sub.illustration?.box,
      aspect: sub.illustration?.aspect,
    }));
}

export const getPathMapping = () => {
  return pages.reduce<{
    [key: string]: {
      name: string | undefined;
      title: string | undefined;
      component: React.FC;
      lead: string | undefined;
      fullWidth: boolean | undefined;
      hideHeader: boolean | undefined;
      fullHeightHeader: boolean | undefined;
      /** Set on a section overview page: its subpages, shown as header cards. */
      subpages?: Subpage[];
    };
  }>((map, item) => {
    // A page or folder can have its own route (folders use it for the section
    // overview page). This is independent of the folder's subpages below.
    if (item.path && item.component) {
      map[item.path] = {
        name: item.name,
        title: item.title,
        component: item.component,
        lead: item.lead,
        fullWidth: "fullWidth" in item ? item.fullWidth : undefined,
        hideHeader: "hideHeader" in item ? item.hideHeader : undefined,
        fullHeightHeader:
          "fullHeightHeader" in item ? item.fullHeightHeader : undefined,
        // A folder's own route is its overview page, so it gets a card per
        // subpage. Plain pages have no folder and get none.
        subpages:
          "folder" in item && item.folder ? toCards(item.folder) : undefined,
      };
    }
    // Register each subpage of a folder.
    if ("folder" in item && item.folder) {
      item.folder.forEach((page) => {
        if (page.path && page.component) {
          map[page.path] = {
            name: page.name,
            title: page.title,
            component: page.component,
            lead: page.lead,
            fullWidth: page.fullWidth,
            hideHeader: page.hideHeader,
            fullHeightHeader: page.fullHeightHeader,
            // A subpage acting as its section's landing page gets cards for
            // the rest of the section — minus itself, since a card linking to
            // the page you are already on would go nowhere.
            subpages: page.showSectionCards
              ? toCards(item.folder as Folder, page.path)
              : undefined,
          };
        }
      });
    }
    return map;
  }, {});
};
