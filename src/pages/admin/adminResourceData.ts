import type { ChapterDoc } from '@/lib/content';
import { localAssetChapters } from '@/src/data/localResources';
import type { WriterContent } from '@/src/data/resources';

export type ResourceSubject = 'botany' | 'zoology' | 'ssc';

export type AdminResource = {
  key: string;
  origin: 'bundled' | 'uploaded';
  subject: ResourceSubject;
  chapterId: number;
  chapterTitle: string;
  writer: WriterContent;
  docId?: string;
  writerIndex?: number;
  hidden: boolean;
};

export const subjectLabels: Record<ResourceSubject, string> = {
  botany: 'উদ্ভিদবিজ্ঞান',
  zoology: 'প্রাণিবিজ্ঞান',
  ssc: 'SSC Biology',
};

function flattenBundledResources(hiddenUrls: Set<string>): AdminResource[] {
  return (Object.entries(localAssetChapters) as [ResourceSubject, ChapterDoc[]][])
    .flatMap(([subject, chapters]) =>
      chapters.flatMap((chapter) =>
        chapter.writers
          .filter((writer) => Boolean(writer.pdfUrl))
          .map((writer, writerIndex) => ({
            key: `bundled-${writer.pdfUrl}`,
            origin: 'bundled' as const,
            subject,
            chapterId: chapter.id,
            chapterTitle: chapter.title,
            writer,
            writerIndex,
            hidden: Boolean(writer.pdfUrl && hiddenUrls.has(writer.pdfUrl)),
          })),
      ),
    );
}

function flattenUploadedResources(chapters: ChapterDoc[], hiddenUrls: Set<string>): AdminResource[] {
  return chapters.flatMap((chapter) => {
    if (!['botany', 'zoology', 'ssc'].includes(chapter.subject)) {
      return [];
    }

    return chapter.writers
      .map((writer, writerIndex) => ({ writer, writerIndex }))
      .filter(({ writer }) => Boolean(writer.pdfUrl))
      .map(({ writer, writerIndex }) => ({
        key: `uploaded-${chapter.docId}-${writerIndex}-${writer.pdfUrl}`,
        origin: 'uploaded' as const,
        subject: chapter.subject as ResourceSubject,
        chapterId: chapter.id,
        chapterTitle: chapter.title,
        writer,
        docId: chapter.docId,
        writerIndex,
        hidden: Boolean(writer.pdfUrl && hiddenUrls.has(writer.pdfUrl)),
      }));
  });
}

export function buildAdminResources(chapters: ChapterDoc[], hiddenUrls: Set<string>) {
  return [
    ...flattenBundledResources(hiddenUrls),
    ...flattenUploadedResources(chapters, hiddenUrls),
  ].sort((a, b) => {
    const subjectSort = a.subject.localeCompare(b.subject);
    if (subjectSort !== 0) return subjectSort;
    if (a.chapterId !== b.chapterId) return a.chapterId - b.chapterId;
    return (a.writer.resourceTitle ?? a.chapterTitle).localeCompare(
      b.writer.resourceTitle ?? b.chapterTitle,
    );
  });
}

export function getAdminResourceStats(resources: AdminResource[]) {
  return {
    total: resources.length,
    visible: resources.filter((resource) => !resource.hidden).length,
    hidden: resources.filter((resource) => resource.hidden).length,
    uploaded: resources.filter((resource) => resource.origin === 'uploaded').length,
  };
}
