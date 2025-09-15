'use client'

import React, { useState } from "react";

interface UploadedDocument {
  id: string;
  name: string;
  icon: React.ReactNode;
}

const DocumentIcon = () => (
  <svg width="24" height="24" viewBox="0 0 25 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M20.9425 6.45263L14.6289 0.138938C14.5399 0.0499687 14.4193 0 14.2934 0H5.39688C4.31645 0 3.4375 0.878953 3.4375 1.95937V22.0406C3.4375 23.121 4.31645 24 5.39688 24H19.1221C20.2025 24 21.0814 23.121 21.0814 22.0406V6.78802C21.0814 6.66225 21.0315 6.54155 20.9425 6.45263ZM14.7678 1.61948L19.462 6.31359H15.7785C15.2212 6.31359 14.7678 5.86022 14.7678 5.30288V1.61948H14.7678ZM20.1328 22.0406C20.1328 22.5979 19.6794 23.0513 19.1221 23.0513H5.39688C4.83958 23.0513 4.38616 22.5979 4.38616 22.0406V1.95937C4.38616 1.40208 4.83958 0.948656 5.39688 0.948656H13.8191V5.30297C13.8191 6.38339 14.698 7.26234 15.7784 7.26234H20.1328V22.0406Z" fill="white"/>
    <path d="M16.0516 12.0475H8.46261C8.20067 12.0475 7.98828 12.2599 7.98828 12.5218C7.98828 12.7838 8.20067 12.9961 8.46261 12.9961H16.0516C16.3136 12.9961 16.5259 12.7838 16.5259 12.5218C16.5259 12.2599 16.3136 12.0475 16.0516 12.0475Z" fill="white"/>
    <path d="M16.0516 14.166H8.46261C8.20067 14.166 7.98828 14.3784 7.98828 14.6403C7.98828 14.9023 8.20067 15.1147 8.46261 15.1147H16.0516C16.3136 15.1147 16.5259 14.9023 16.5259 14.6403C16.5259 14.3784 16.3136 14.166 16.0516 14.166Z" fill="white"/>
    <path d="M16.0516 16.2845H8.46261C8.20067 16.2845 7.98828 16.4969 7.98828 16.7589C7.98828 17.0208 8.20067 17.2332 8.46261 17.2332H16.0516C16.3136 17.2332 16.5259 17.0208 16.5259 16.7589C16.5259 16.4969 16.3136 16.2845 16.0516 16.2845Z" fill="white"/>
    <path d="M13.5852 18.4032H8.46261C8.20067 18.4032 7.98828 18.6156 7.98828 18.8775C7.98828 19.1395 8.20067 19.3519 8.46261 19.3519H13.5852C13.8472 19.3519 14.0595 19.1395 14.0595 18.8775C14.0595 18.6156 13.8472 18.4032 13.5852 18.4032Z" fill="white"/>
  </svg>
);

const UploadIcon = () => (
  <svg width="52" height="52" viewBox="0 0 52 52" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M37.7756 22.5103V12.6695C37.7756 12.3878 37.6455 12.1276 37.4614 11.9217L26.4284 0.336029C26.2225 0.119415 25.9297 0 25.6374 0H8.14483C4.91546 0 2.33594 2.63348 2.33594 5.86324V38.9404C2.33594 42.1702 4.91546 44.7604 8.14483 44.7604H21.9525C24.5642 49.0955 29.3115 51.9999 34.7193 51.9999C42.9343 51.9999 49.643 45.3238 49.643 37.098C49.6541 29.9125 44.495 23.9084 37.7756 22.5103ZM26.7212 3.80422L34.1234 11.5964H29.3222C27.8916 11.5964 26.7212 10.4153 26.7212 8.9847V3.80422ZM8.14483 42.5927C6.11834 42.5927 4.50366 40.9669 4.50366 38.9404V5.86324C4.50366 3.82565 6.11834 2.16772 8.14483 2.16772H24.5535V8.9847C24.5535 11.6182 26.6887 13.7641 29.3222 13.7641H35.6079V22.2283C35.283 22.2176 35.0227 22.185 34.7411 22.185C30.9587 22.185 27.4798 23.6374 24.857 25.9135H11.0929C10.4966 25.9135 10.0091 26.4011 10.0091 26.9969C10.0091 27.5932 10.4966 28.0808 11.0929 28.0808H22.8412C22.0716 29.1647 21.432 30.2485 20.9338 31.4407H11.0929C10.4966 31.4407 10.0091 31.9283 10.0091 32.5245C10.0091 33.1204 10.4966 33.6084 11.0929 33.6084H20.2292C19.9582 34.6923 19.8174 35.8951 19.8174 37.098C19.8174 39.0487 20.1966 40.978 20.8794 42.6038H8.14483V42.5927ZM34.7304 49.8433C27.7075 49.8433 21.9958 44.1316 21.9958 37.1087C21.9958 30.0859 27.6964 24.3742 34.7304 24.3742C41.764 24.3742 47.4645 30.0859 47.4645 37.1087C47.4645 44.1316 41.7532 49.8433 34.7304 49.8433Z" fill="#DF69FF"/>
    <path d="M35.5014 29.1103C35.2955 28.8937 35.0138 28.7635 34.7103 28.7635C34.4068 28.7635 34.1252 28.8937 33.9193 29.1103L27.568 35.9273C27.1562 36.3609 27.1888 37.0544 27.6224 37.4555C28.056 37.8673 28.7602 37.8347 29.172 37.4015L33.659 32.6003V44.4351C33.659 45.0314 34.1466 45.519 34.7429 45.519C35.3387 45.519 35.8267 45.0314 35.8267 44.4351V32.6003L40.2808 37.4015C40.4978 37.6288 40.7795 37.7482 41.0723 37.7482C41.3321 37.7482 41.5924 37.6507 41.809 37.4555C42.2426 37.0437 42.2751 36.3609 41.8633 35.9273L35.5014 29.1103Z" fill="#DF69FF"/>
  </svg>
);

const ActionIcon = ({ type }: { type: 'download' | 'delete' | 'view' }) => {
  if (type === 'download') {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" width="23" height="19" viewBox="0 0 23 19" fill="none">
        <path fillRule="evenodd" clipRule="evenodd" d="M11.4457 13.5411C11.0056 13.5411 10.6484 13.2051 10.6484 12.7911V0.750122C10.6484 0.336122 11.0056 0.00012207 11.4457 0.00012207C11.8857 0.00012207 12.2429 0.336122 12.2429 0.750122V12.7911C12.2429 13.2051 11.8857 13.5411 11.4457 13.5411Z" fill="#D8D7D7"/>
        <path fillRule="evenodd" clipRule="evenodd" d="M11.4431 13.5412C11.2315 13.5412 11.0274 13.4622 10.8786 13.3202L7.779 10.3932C7.46862 10.0992 7.46968 9.62415 7.78113 9.33215C8.09364 9.04015 8.59749 9.04015 8.90787 9.33415L11.4431 11.7292L13.9782 9.33415C14.2886 9.04015 14.7925 9.04015 15.105 9.33215C15.4164 9.62415 15.4175 10.0992 15.1071 10.3932L12.0075 13.3202C11.8587 13.4622 11.6546 13.5412 11.4431 13.5412Z" fill="#D8D7D7"/>
        <mask id="mask0_42670_1701" style={{ maskType: "luminance" }} maskUnits="userSpaceOnUse" x="0" y="4" width="23" height="15">
          <path fillRule="evenodd" clipRule="evenodd" d="M0.8125 4.73267H22.0717V18.4767H0.8125V4.73267Z" fill="white"/>
        </mask>
        <g mask="url(#mask0_42670_1701)">
          <path fillRule="evenodd" clipRule="evenodd" d="M17.3682 18.4767H5.52677C2.92781 18.4767 0.8125 16.4877 0.8125 14.0417V9.15667C0.8125 6.71667 2.92249 4.73267 5.5172 4.73267H6.51745C6.95752 4.73267 7.31468 5.06867 7.31468 5.48267C7.31468 5.89667 6.95752 6.23267 6.51745 6.23267H5.5172C3.80157 6.23267 2.40695 7.54367 2.40695 9.15667V14.0417C2.40695 15.6607 3.80582 16.9767 5.52677 16.9767H17.3682C19.0817 16.9767 20.4774 15.6637 20.4774 14.0517V9.16767C20.4774 7.54867 19.0775 6.23267 17.3587 6.23267H16.368C15.9279 6.23267 15.5708 5.89667 15.5708 5.48267C15.5708 5.06867 15.9279 4.73267 16.368 4.73267H17.3587C19.9576 4.73267 22.0719 6.72267 22.0719 9.16767V14.0517C22.0719 16.4917 19.9608 18.4767 17.3682 18.4767Z" fill="#D8D7D7"/>
        </g>
      </svg>
    );
  }

  if (type === 'delete') {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" width="21" height="20" viewBox="0 0 21 20" fill="none">
        <path fillRule="evenodd" clipRule="evenodd" d="M10.4748 19.9999C9.03452 19.9999 7.63034 19.9849 6.24104 19.9579C4.46376 19.9249 3.23391 18.8409 3.033 17.1289C2.69817 14.2889 2.12523 7.59491 2.11991 7.52791C2.08377 7.11491 2.41117 6.75291 2.85017 6.71991C3.2828 6.70891 3.67397 6.99491 3.70905 7.40691C3.71437 7.47491 4.28624 14.1459 4.61789 16.9639C4.73163 17.9369 5.28969 18.4389 6.274 18.4579C8.93142 18.5109 11.6431 18.5139 14.5662 18.4639C15.6122 18.4449 16.1777 17.9529 16.2946 16.9569C16.6241 14.1629 17.1981 7.47491 17.2045 7.40691C17.2396 6.99491 17.6276 6.70691 18.0623 6.71991C18.5013 6.75391 18.8287 7.11491 18.7936 7.52791C18.7873 7.59591 18.2111 14.3069 17.8795 17.1219C17.6733 18.8689 16.4466 19.9319 14.5949 19.9639C13.178 19.9869 11.811 19.9999 10.4748 19.9999Z" fill="#D8D7D7"/>
        <path fillRule="evenodd" clipRule="evenodd" d="M19.4676 4.98926H1.44176C1.00169 4.98926 0.644531 4.65326 0.644531 4.23926C0.644531 3.82526 1.00169 3.48926 1.44176 3.48926H19.4676C19.9076 3.48926 20.2648 3.82526 20.2648 4.23926C20.2648 4.65326 19.9076 4.98926 19.4676 4.98926Z" fill="#D8D7D7"/>
        <path fillRule="evenodd" clipRule="evenodd" d="M15.9937 4.98924C14.7841 4.98924 13.7339 4.17824 13.4958 3.06224L13.2375 1.84624C13.1832 1.66124 12.959 1.50024 12.7038 1.50024H8.2043C7.94919 1.50024 7.7249 1.66124 7.66006 1.89224L7.41239 3.06224C7.17535 4.17824 6.12407 4.98924 4.91441 4.98924C4.47434 4.98924 4.11719 4.65324 4.11719 4.23924C4.11719 3.82524 4.47434 3.48924 4.91441 3.48924C5.36724 3.48924 5.76054 3.18524 5.84983 2.76724L6.10813 1.55124C6.37068 0.619244 7.2285 0.000244141 8.2043 0.000244141H12.7038C13.6797 0.000244141 14.5375 0.619244 14.7894 1.50624L15.0594 2.76724C15.1476 3.18524 15.5409 3.48924 15.9937 3.48924C16.4338 3.48924 16.791 3.82524 16.791 4.23924C16.791 4.65324 16.4338 4.98924 15.9937 4.98924Z" fill="#D8D7D7"/>
      </svg>
    );
  }

  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="17" viewBox="0 0 22 17" fill="none">
      <path fillRule="evenodd" clipRule="evenodd" d="M10.9854 5.64136C9.57165 5.64136 8.42258 6.72336 8.42258 8.05336C8.42258 9.38236 9.57165 10.4634 10.9854 10.4634C12.3991 10.4634 13.5493 9.38236 13.5493 8.05336C13.5493 6.72336 12.3991 5.64136 10.9854 5.64136ZM10.9854 11.9634C8.69257 11.9634 6.82812 10.2094 6.82812 8.05336C6.82812 5.89636 8.69257 4.14136 10.9854 4.14136C13.2782 4.14136 15.1437 5.89636 15.1437 8.05336C15.1437 10.2094 13.2782 11.9634 10.9854 11.9634Z" fill="#D8D7D7"/>
      <mask id="mask0_42670_1778" style={{ maskType: "luminance" }} maskUnits="userSpaceOnUse" x="0" y="0" width="22" height="17">
        <path fillRule="evenodd" clipRule="evenodd" d="M0.355469 0.000244141H21.6147V16.1052H0.355469V0.000244141Z" fill="white"/>
      </mask>
      <g mask="url(#mask0_42670_1778)">
        <path fillRule="evenodd" clipRule="evenodd" d="M2.02406 8.05251C4.00119 12.1615 7.33147 14.6045 10.9849 14.6055C14.6383 14.6045 17.9686 12.1615 19.9457 8.05251C17.9686 3.94451 14.6383 1.50151 10.9849 1.50051C7.33253 1.50151 4.00119 3.94451 2.02406 8.05251ZM10.987 16.1055H10.9828H10.9817C6.58526 16.1025 2.6374 13.2035 0.420044 8.34851C0.333944 8.15951 0.333944 7.94551 0.420044 7.75651C2.6374 2.90251 6.58632 0.00350586 10.9817 0.000505859C10.9838 -0.000494141 10.9838 -0.000494141 10.9849 0.000505859C10.987 -0.000494141 10.987 -0.000494141 10.9881 0.000505859C15.3845 0.00350586 19.3324 2.90251 21.5497 7.75651C21.6369 7.94551 21.6369 8.15951 21.5497 8.34851C19.3334 13.2035 15.3845 16.1025 10.9881 16.1055H10.987Z" fill="#D8D7D7"/>
      </g>
    </svg>
  );
};

const CoachReplica: React.FC = () => {
  const [uploadedDocuments] = useState<UploadedDocument[]>([
    { id: '1', name: 'Fitness Coach Training', icon: <DocumentIcon /> },
    { id: '2', name: 'Fitness Coach Training', icon: <DocumentIcon /> },
    { id: '3', name: 'Fitness Coach Training', icon: <DocumentIcon /> },
    { id: '4', name: 'Fitness Coach Training', icon: <DocumentIcon /> },
    { id: '5', name: 'Fitness Coach Training', icon: <DocumentIcon /> },
    { id: '6', name: 'Fitness Coach Training', icon: <DocumentIcon /> },
  ]);

  return (
    <div className="flex-1 flex flex-col min-w-0">
      {/* Header */}
      <div className="flex w-full px-4 lg:px-[30px] py-5 justify-between items-center border-b border-[#373535] min-h-[86px] flex-wrap gap-4">
        <h1 className="text-[#F9F9F9] font-inter text-4xl font-semibold leading-normal tracking-[-0.96px]">
          Bot Training
        </h1>

        {/* Action Buttons */}
        <div className="flex items-center gap-8">
          <button className="text-[#DF69FF] font-inter text-lg font-semibold leading-[25.6px]">
            Preview ChatBot
          </button>
          <div className="w-px h-[27px] bg-[#373535]"></div>
          <button className="text-[#DF69FF] font-inter text-lg font-semibold leading-[25.6px]">
            Copy ChatBot Link
          </button>
        </div>
      </div>

      {/* Page Content */}
      <div className="flex-1 overflow-auto p-[30px]">
        <div className="flex flex-col gap-[18px] w-full">
          {/* Main Content */}
          <div className="flex flex-col lg:flex-row gap-[30px] w-full">
            {/* Left Section - Training */}
            <div className="flex-1 flex flex-col gap-[30px">
              {/* Train Section */}
              <div className="flex flex-col gap-3">
                <h3 className="text-[#F9F9F9] font-inter text-2xl font-medium leading-[25.6px]">
                  Train The Next Level Coach AI
                </h3>
                <p className="text-[#C5C5C5] font-inter text-sm font-normal leading-[150%] max-w-[980px]">
                  In order to personalize your automated email responses and attune them to your coaching philosophy. Upload document related to your course content, your methods, your philosophy here.
                </p>
              </div>

              {/* Upload Section */}
              <div className="flex flex-col gap-3">
                <label className="text-[#F9F9F9] font-inter text-sm font-medium leading-[25.6px]">
                  Upload Document<span className="text-red-500">*</span>
                </label>

                <div className="flex h-[388px] justify-center items-center rounded-[30px] border border-dashed border-[#454444] bg-gradient-to-br from-[rgba(38,38,38,0.30)] to-[rgba(19,19,19,0.30)]">
                  <div className="flex flex-col items-center gap-5">
                    <UploadIcon />
                    <div className="flex flex-col items-center gap-4">
                      <div className="text-white text-center font-inter text-xl font-normal leading-5">
                        Drag or click to upload the file
                      </div>
                      <div className="text-white text-center font-inter text-base font-medium leading-5 opacity-50">
                        Maximum File size 30MB
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-5">
                <button className="flex px-5 py-[13px] justify-center items-center gap-2 rounded-lg bg-gradient-to-t from-[#FEBEFA] via-[#B339D4] to-[#7B21BA]">
                    <span className="text-white font-inter text-base font-semibold leading-6 tracking-[-0.32px]">
                      Upload File
                    </span>
                </button>
                <button className="flex px-5 py-[13px] justify-center items-center gap-2 rounded-lg border border-white">
                    <span className="text-white font-inter text-base font-medium leading-6 tracking-[-0.32px]">
                      Cancel
                    </span>
                </button>
              </div>
            </div>

            {/* Right Section - Uploaded Documents */}
            <div className="w-full lg:w-[709px] flex flex-col gap-5">
              <h3 className="text-[#F9F9F9] font-inter text-2xl font-medium leading-[25.6px]">
                Uploaded Documents
              </h3>

              <div className="flex flex-col gap-5">
                {uploadedDocuments.map((doc) => (
                  <div key={doc.id} className="w-full h-[74px] rounded-[10px] bg-gradient-to-br from-[rgba(38,38,38,0.30)] to-[rgba(19,19,19,0.30)] relative">
                    <div className="flex items-center h-full px-5 gap-3">
                      <div className="flex items-center gap-[10px] flex-1">
                        {doc.icon}
                        <span className="text-[#F9F9F9] font-['Mier A'] text-base font-medium leading-5 capitalize">
                            {doc.name}
                          </span>
                      </div>

                      <div className="flex items-center gap-3">
                        <button className="w-[26px] h-[24px] flex justify-center items-center">
                          <ActionIcon type="download" />
                        </button>
                        <button className="w-[26px] h-[24px] flex justify-center items-center">
                          <ActionIcon type="view" />
                        </button>
                        <button className="w-[26px] h-[24px] flex justify-center items-center">
                          <ActionIcon type="delete" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoachReplica;
