export class Bible {
   additionalPages?: [Object];
   editionData?: BibleData;
}

export class BibleData {
   bookCount?: string;
   books: Map<String, BibleBook>;
   locale?: [];
}

export class BibleBook {
   chapterDisplayTitle?: String
   hasAudio?: Boolean
   officialAbbreviation?: String
   standardName?: String
   urlSegment?: String
   chapterCount?: String
}

export interface BibleLanguage {
   lang:     Lang;
   editions: Edition[];
}

export interface Edition {
   title:      string;
   symbol:     string;
   contentAPI?: string;
}

export interface Lang {
   symbol:         string;
   langcode:       string;
   name:           string;
   vernacularName: string;
}
