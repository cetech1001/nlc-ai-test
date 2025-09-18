'use client'

import {FC} from "react";
// import dynamic from 'next/dynamic';
import {Editor} from "@tinymce/tinymce-react";

import {appConfig} from "../config";
// import { Skeleton } from "@nlc-ai/web-ui";

interface IProps {
  content: string;
  updateContent: (content: string) => void;
  view?: 'mobile' | 'desktop';
}

/*const Editor = dynamic(() => import('@tinymce/tinymce-react').then(mod => mod.Editor), {
  ssr: false,
  loading: () => <Skeleton className={"w-full h-96 border border-neutral-600"}/>
});*/

const styles = `
  .tox .tox-editor-header {
    background-color: rgba(23, 23, 23, 0.8) !important;
    border: 1px solid rgb(64, 64, 64) !important;
    border-bottom: none !important;
    border-radius: 8px 8px 0 0 !important;
  }

  .tox .tox-edit-area {
    border: 1px solid rgb(64, 64, 64) !important;
    border-top: none !important;
    border-radius: 0 0 8px 8px !important;
  }

  .tox .tox-statusbar {
    background-color: rgba(23, 23, 23, 0.8) !important;
    border: 1px solid rgb(64, 64, 64) !important;
    border-top: none !important;
  }

  .tox .tox-toolbar {
    background-color: rgba(23, 23, 23, 0.8) !important;
  }

  .tox .tox-tbtn {
    color: #d6d3d1 !important;
  }

  .tox .tox-tbtn:hover {
    background-color: rgba(255, 255, 255, 0.1) !important;
  }

  .tox .tox-tbtn--enabled {
    background-color: rgba(123, 33, 186, 0.3) !important;
    color: white !important;
  }

  .tox .tox-menubar {
    background-color: rgba(23, 23, 23, 0.8) !important;
  }

  .tinymce-wrapper {
    height: 100%;
  }

  .tinymce-wrapper .tox-tinymce {
    height: 100% !important;
  }

  .tinymce-wrapper-mobile .tox-tinymce {
    border-radius: 8px !important;
  }
`;

export const RichTextEditor: FC<IProps> = ({ content, updateContent, view }) => {
  const handleEditorChange = (content: string) => {
    updateContent(content);
  };

  if (view === 'mobile') {
    return (
      <>
        <div className="tinymce-wrapper-mobile">
          <Editor
            apiKey={appConfig.tinyMCE.apiKey}
            value={content}
            onEditorChange={handleEditorChange}
            init={{
              height: 350,
              menubar: false,
              elementpath: false,
              plugins: [
                'advlist', 'autolink', 'lists', 'link', 'image', 'charmap',
                'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
                'insertdatetime', 'media', 'table', 'preview', 'help', 'wordcount'
              ],
              toolbar: 'undo redo | blocks | bold italic underline | alignleft aligncenter alignright | bullist numlist | link | forecolor',
              content_style: `
                        body {
                          font-family: Inter, sans-serif;
                          font-size: 16px;
                          color: #d6d3d1;
                          background: rgb(0 0 0 / 1);
                          line-height: 1.6;
                          margin: 0;
                          padding: 8px;
                        }
                        a { color: #9333ea; text-decoration: underline; }
                        strong { color: #f5f5f4; }
                      `,
              skin: 'oxide-dark',
              content_css: 'dark',
              setup: (editor: any) => {
                editor.on('init', () => {
                  const container = editor.getContainer();
                  if (container) {
                    container.style.border = '1px solid rgb(64, 64, 64)';
                    container.style.borderRadius = '8px';
                    container.style.backgroundColor = 'rgba(23, 23, 23, 0.5)';
                  }
                });
                editor.on('blur', () => {
                  setTimeout(() => {
                    window.scrollTo(window.scrollX, window.scrollY + 1);
                    window.scrollTo(window.scrollX, window.scrollY - 1);
                  }, 300);
                });
              }
            }}
          />
        </div>

        <style>{styles}</style>
      </>
    );
  }

  return (
    <>
      <div className="flex-1 tinymce-wrapper min-h-0">
        <Editor
          apiKey={appConfig.tinyMCE.apiKey}
          value={content}
          onEditorChange={handleEditorChange}
          init={{
            height: '100%',
            menubar: false,
            elementpath: false,
            plugins: [
              'advlist', 'autolink', 'lists', 'link', 'image', 'charmap',
              'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
              'insertdatetime', 'media', 'table', 'preview', 'help', 'wordcount'
            ],
            toolbar: 'undo redo | blocks | bold italic underline | alignleft aligncenter alignright alignjustify | bullist numlist | link | forecolor backcolor | outdent indent',
            content_style: `
                        body {
                          font-family: Inter, sans-serif;
                          font-size: 16px;
                          color: #d6d3d1;
                          background: rgb(0 0 0 / 1);
                          line-height: 1.6;
                          margin: 0;
                          padding: 12px;
                        }
                        a { color: #9333ea; text-decoration: underline; }
                        strong { color: #f5f5f4; }
                      `,
            skin: 'oxide-dark',
            content_css: 'dark',
            resize: false,
            branding: false,
            setup: (editor: any) => {
              editor.on('init', () => {
                const container = editor.getContainer();
                if (container) {
                  container.style.border = '1px solid rgb(64, 64, 64)';
                  container.style.borderRadius = '8px';
                  container.style.backgroundColor = 'rgba(23, 23, 23, 0.5)';
                  container.style.height = '100%';
                }
              });
              editor.on('blur', () => {
                setTimeout(() => {
                  window.scrollTo(window.scrollX, window.scrollY + 1);
                  window.scrollTo(window.scrollX, window.scrollY - 1);
                }, 300);
              });
            }
          }}
        />
      </div>

      <style>{styles}</style>
    </>
  );
}
