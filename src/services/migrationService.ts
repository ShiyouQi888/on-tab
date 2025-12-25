import { db } from '../db/db';
import { bookmarkService } from './bookmarkService';

export const migrationService = {
  async importFromBrowser() {
    return new Promise((resolve, reject) => {
      if (typeof chrome === 'undefined' || !chrome.bookmarks) {
        reject(new Error('Browser bookmarks API not available'));
        return;
      }

      chrome.bookmarks.getTree(async (tree) => {
        const bookmarks: any[] = [];
        const processNode = (node: chrome.bookmarks.BookmarkTreeNode) => {
          if (node.url) {
            bookmarks.push({
              title: node.title,
              url: node.url,
              tags: [],
              notes: 'Imported from browser'
            });
          }
          if (node.children) {
            node.children.forEach(processNode);
          }
        };
        tree.forEach(processNode);

        for (const b of bookmarks) {
          await bookmarkService.addBookmark(b);
        }
        resolve(bookmarks.length);
      });
    });
  },

  async exportToJSON() {
    const bookmarks = await db.bookmarks.where('deleted').equals(0).toArray();
    const data = JSON.stringify(bookmarks, null, 2);
    this.downloadFile(data, `bookmarks-export-${new Date().toISOString().split('T')[0]}.json`, 'application/json');
  },

  async exportToHTML() {
    const bookmarks = await db.bookmarks.where('deleted').equals(0).toArray();
    let html = `<!DOCTYPE NETSCAPE-Bookmark-file-1>
<!-- This is an automatically generated file.
     It will be read and classified freely by browsers. -->
<META HTTP-EQUIV="Content-Type" CONTENT="text/html; charset=UTF-8">
<TITLE>Bookmarks</TITLE>
<H1>Bookmarks</H1>
<DL><p>
`;

    for (const b of bookmarks) {
      html += `    <DT><A HREF="${b.url}" ADD_DATE="${Math.floor(b.createdAt / 1000)}" TAGS="${b.tags.join(',')}">${b.title}</A>\n`;
      if (b.notes) {
        html += `    <DD>${b.notes}\n`;
      }
    }

    html += `</DL><p>`;
    this.downloadFile(html, `bookmarks-export-${new Date().toISOString().split('T')[0]}.html`, 'text/html');
  },

  async importFromHTML(file: File) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const content = e.target?.result as string;
          const parser = new DOMParser();
          const doc = parser.parseFromString(content, 'text/html');
          const links = doc.querySelectorAll('a');
          let count = 0;

          for (const link of Array.from(links)) {
            const title = link.textContent || 'Untitled';
            const url = link.getAttribute('href');
            if (url && (url.startsWith('http') || url.startsWith('https'))) {
              await bookmarkService.addBookmark({
                title,
                url,
                tags: link.getAttribute('tags')?.split(',').filter(t => t) || [],
                notes: 'Imported from HTML'
              });
              count++;
            }
          }
          resolve(count);
        } catch (err) {
          reject(err);
        }
      };
      reader.readAsText(file);
    });
  },

  downloadFile(content: string, fileName: string, contentType: string) {
    const blob = new Blob([content], { type: contentType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
  },

  async importFromJSON(file: File) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const bookmarks = JSON.parse(e.target?.result as string);
          for (const b of bookmarks) {
            // Validate basic structure
            if (b.title && b.url) {
              await bookmarkService.addBookmark({
                title: b.title,
                url: b.url,
                tags: b.tags || [],
                notes: b.notes || ''
              });
            }
          }
          resolve(bookmarks.length);
        } catch (err) {
          reject(err);
        }
      };
      reader.readAsText(file);
    });
  }
};
