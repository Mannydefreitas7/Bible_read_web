export class Bible {
   additionalPages?: [Object];
   editionData?: BibleData;
}

export class BibleData {
   bookCount?: string;
   books?: [BibleBook];
   locale?: [];
}

class BibleBook {
   chapterDisplayTitle?: String
   hasAudio?: Boolean
   officialAbbreviation?: String
   standardName?: String
   urlSegment?: String
}
