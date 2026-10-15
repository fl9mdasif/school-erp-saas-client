export type TSiteTemplate = "classic" | "modern";
export type TGalleryImage = { url: string; caption?: string };
export type TSectionsVisible = { about: boolean; teachers: boolean; notices: boolean; gallery: boolean; admission: boolean; results: boolean };

export type TSite = {
  _id: string;
  isPublished: boolean;
  theme: { primaryColor: string; template: TSiteTemplate };
  hero?: { title?: string; subtitle?: string; imageUrl?: string };
  about?: string;
  mission?: string;
  headMessage?: { name: string; designation: string; photoUrl?: string; text: string };
  admissionInfo?: { isOpen: boolean; text?: string; classes?: string[]; lastDate?: string };
  contact?: { phone?: string; email?: string; address?: string; mapUrl?: string };
  gallery: TGalleryImage[];
  social?: { facebook?: string; youtube?: string };
  seo?: { title?: string; description?: string };
  sectionsVisible: TSectionsVisible;
};
export type TSiteInput = Partial<Omit<TSite, "_id" | "isPublished">>;

export type TStaffProfile = {
  _id: string;
  userId?: string;
  name: string;
  designation: string;
  photoUrl?: string;
  bio?: string;
  showOnPublicSite: boolean;
  order: number;
};
export type TStaffProfileInput = Omit<TStaffProfile, "_id">;
