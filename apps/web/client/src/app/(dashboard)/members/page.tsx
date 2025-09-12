import React from 'react';

const MembersPage = () => {
  return (
    <div className="w-[1920px] h-[1080px] relative bg-black overflow-hidden">
      <div
        className="w-[1633px] px-7 py-5 left-[287px] top-0 absolute border-b border-neutral-700 inline-flex flex-col justify-start items-start gap-2.5">
        <div className="self-stretch inline-flex justify-between items-center">
          <div className="flex-1 inline-flex flex-col justify-start items-start gap-1.5">
            <div
              className="w-[640px] h-12 max-h-14 min-h-12 px-5 py-2.5 bg-white/20 rounded-[10px] outline outline-1 outline-offset-[-1px] inline-flex justify-start items-center gap-3">
              <div className="w-6 h-6 relative opacity-40 overflow-hidden">
                <div
                  className="w-4 h-4 left-[3px] top-[3px] absolute outline outline-[1.50px] outline-offset-[-0.75px] outline-white"/>
              </div>
              <div className="justify-start text-white text-base font-normal font-['Inter'] leading-tight">Search
                for..
              </div>
              <div className="w-6 h-6 relative opacity-0">
                <div
                  className="w-4 h-px left-[3.09px] top-[8.93px] absolute outline outline-[1.50px] outline-offset-[-0.75px] outline-stone-50"/>
                <div
                  className="w-px h-px left-[15.98px] top-[12.84px] absolute outline outline-[1.50px] outline-offset-[-0.75px] outline-stone-50"/>
                <div
                  className="w-px h-px left-[11.55px] top-[12.84px] absolute outline outline-[1.50px] outline-offset-[-0.75px] outline-stone-50"/>
                <div
                  className="w-px h-px left-[7.10px] top-[12.84px] absolute outline outline-[1.50px] outline-offset-[-0.75px] outline-stone-50"/>
                <div
                  className="w-px h-px left-[15.98px] top-[16.72px] absolute outline outline-[1.50px] outline-offset-[-0.75px] outline-stone-50"/>
                <div
                  className="w-px h-px left-[11.55px] top-[16.72px] absolute outline outline-[1.50px] outline-offset-[-0.75px] outline-stone-50"/>
                <div
                  className="w-px h-px left-[7.10px] top-[16.72px] absolute outline outline-[1.50px] outline-offset-[-0.75px] outline-stone-50"/>
                <div
                  className="w-px h-[3.29px] left-[15.58px] top-[2px] absolute outline outline-[1.50px] outline-offset-[-0.75px] outline-stone-50"/>
                <div
                  className="w-px h-[3.29px] left-[7.50px] top-[2px] absolute outline outline-[1.50px] outline-offset-[-0.75px] outline-stone-50"/>
                <div
                  className="w-4 h-5 left-[3px] top-[3.58px] absolute outline outline-[1.50px] outline-offset-[-0.75px] outline-stone-50"/>
              </div>
            </div>
          </div>
          <div className="flex justify-start items-center gap-6">
            <div className="w-6 h-6 relative overflow-hidden">
              <div
                className="w-4 h-4 left-[3px] top-[3.75px] absolute outline outline-[1.20px] outline-offset-[-0.60px] outline-white"/>
            </div>
            <div className="w-6 h-6 relative overflow-hidden">
              <div
                className="w-4 h-4 left-[3.69px] top-[3px] absolute outline outline-[1.20px] outline-offset-[-0.60px] outline-white"/>
            </div>
            <div
              className="px-3 py-2 bg-gradient-to-b from-neutral-800 to-neutral-900 rounded-[10px] outline outline-1 outline-offset-[-1px] outline-neutral-700 inline-flex flex-col justify-center items-center gap-4">
              <div className="self-stretch inline-flex justify-start items-center gap-2">
                <img className="w-7 h-7 rounded-[10px]" src="https://placehold.co/30x30"/>
                <div className="w-40 inline-flex flex-col justify-start items-start gap-2">
                  <div
                    className="self-stretch justify-center text-stone-50 text-base font-medium font-['Inter'] leading-relaxed">Andrew
                    Kramer
                  </div>
                  <div
                    className="self-stretch justify-center text-stone-300 text-xs font-normal font-['Inter'] leading-relaxed">kramer.andrew@email.com
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="w-20 h-2.5 left-[2549px] top-[218px] absolute justify-center"><span
        className="text-stone-50 text-sm font-medium font-['Inter'] leading-relaxed">Survey Title</span><span
        className="text-red-600 text-sm font-medium font-['Inter'] leading-relaxed">*</span></div>
      <div
        className="w-64 h-72 left-[1857px] top-[163px] absolute opacity-40 bg-[radial-gradient(ellipse_50.00%_50.00%_at_50.00%_50.00%,_#D497FF_0%,_#7B21BA_100%)] rounded-full blur-[112.55px]"/>
      <div
        className="w-80 h-14 max-h-14 min-h-12 px-5 py-2.5 left-[2549px] top-[242px] absolute rounded-[10px] outline outline-1 outline-offset-[-1px] outline-white/30 inline-flex justify-between items-center">
        <div className="opacity-50 justify-start text-white text-base font-normal font-['Inter'] leading-tight">Enter
          survey title
        </div>
        <div className="w-6 h-6 relative opacity-0">
          <div className="w-6 h-6 left-0 top-0 absolute">
            <div
              className="w-3.5 h-1.5 left-[5px] top-[8.50px] absolute outline outline-[1.50px] outline-offset-[-0.75px] outline-stone-50"/>
          </div>
        </div>
      </div>
      <div
        className="h-[1080px] left-0 top-0 absolute bg-black border-r border-zinc-800 inline-flex flex-col justify-start items-center gap-6">
        <div className="self-stretch h-24 flex flex-col justify-between items-start">
          <div className="w-72 flex-1 px-6 py-2.5 flex flex-col justify-center items-start gap-2.5">
            <img className="w-36 h-11" src="https://placehold.co/150x45"/>
          </div>
          <div className="self-stretch h-px bg-zinc-800 rounded-[100px]"/>
        </div>
        <div className="self-stretch px-5 flex flex-col justify-start items-start gap-2.5">
          <div className="self-stretch inline-flex justify-start items-center gap-3">
            <img className="w-10 h-10 rounded-lg" src="https://placehold.co/40x40"/>
            <div className="flex-1 flex justify-start items-center gap-1">
              <div
                className="flex-1 justify-start text-stone-50 text-xl font-semibold font-['Inter'] leading-loose">Ultimate
                Branding Course
              </div>
              <div className="w-6 h-6 relative opacity-40 overflow-hidden">
                <div
                  className="w-2.5 h-1 left-[7px] top-[5px] absolute outline outline-[1.50px] outline-offset-[-0.75px] outline-white"/>
                <div
                  className="w-2.5 h-1 left-[7px] top-[16px] absolute outline outline-[1.50px] outline-offset-[-0.75px] outline-white"/>
              </div>
            </div>
          </div>
        </div>
        <div className="self-stretch flex-1 px-3 border-r border-zinc-800 flex flex-col justify-start items-start">
          <div className="self-stretch flex-1 flex flex-col justify-between items-start">
            <div className="self-stretch flex flex-col justify-start items-start gap-4">
              <div className="self-stretch flex flex-col justify-center items-center gap-2.5">
                <div className="self-stretch p-3 rounded-[10px] inline-flex justify-start items-center gap-4">
                  <div className="w-5 h-5 relative overflow-hidden">
                    <div
                      className="w-4 h-3.5 left-[1.88px] top-[2.50px] absolute outline outline-[1.20px] outline-offset-[-0.60px] outline-neutral-400"/>
                  </div>
                  <div
                    className="justify-center text-neutral-400 text-sm font-semibold font-['Inter'] leading-relaxed">Community
                  </div>
                </div>
                <div className="self-stretch p-3 rounded-[10px] inline-flex justify-start items-center gap-4">
                  <div className="w-5 h-5 relative">
                    <div
                      className="w-4 h-3.5 left-[1.66px] top-[2.50px] absolute outline outline-[1.20px] outline-offset-[-0.60px] outline-neutral-400"/>
                  </div>
                  <div
                    className="justify-center text-neutral-400 text-sm font-semibold font-['Inter'] leading-relaxed">Classroom
                  </div>
                </div>
                <div className="self-stretch p-3 rounded-[10px] inline-flex justify-start items-center gap-4">
                  <div className="w-5 h-5 relative overflow-hidden">
                    <div
                      className="w-3.5 h-3.5 left-[2.50px] top-[2.50px] absolute outline outline-[1.20px] outline-offset-[-0.60px] outline-neutral-400"/>
                  </div>
                  <div
                    className="justify-center text-neutral-400 text-sm font-semibold font-['Inter'] leading-relaxed">Calendar
                  </div>
                </div>
                <div
                  className="self-stretch p-3 bg-zinc-900 rounded-[10px] inline-flex justify-start items-center gap-4">
                  <div className="w-5 h-5 relative overflow-hidden">
                    <div
                      className="w-4 h-3.5 left-[1.88px] top-[3.12px] absolute outline outline-[1.20px] outline-offset-[-0.60px] outline-neutral-400"/>
                  </div>
                  <div
                    className="justify-center text-neutral-400 text-sm font-semibold font-['Inter'] leading-relaxed">Members
                  </div>
                </div>
                <div className="self-stretch p-3 rounded-[10px] inline-flex justify-start items-center gap-4">
                  <div className="w-5 h-5 relative overflow-hidden">
                    <div
                      className="w-3.5 h-3 left-[2.50px] top-[6.67px] absolute outline outline-[1.20px] outline-offset-[-0.60px] outline-neutral-400"/>
                    <div className="w-1.5 h-[5px] left-[7.38px] top-[0.42px] absolute bg-neutral-400 rounded-[0.20px]"/>
                  </div>
                  <div
                    className="justify-center text-neutral-400 text-sm font-semibold font-['Inter'] leading-relaxed">Leaderboard
                  </div>
                </div>
                <div className="self-stretch p-3 rounded-[10px] inline-flex justify-start items-center gap-4">
                  <div className="w-5 h-5 relative overflow-hidden">
                    <div
                      className="w-4 h-4 left-[1.66px] top-[1.67px] absolute outline outline-[1.20px] outline-offset-[-0.60px] outline-neutral-400"/>
                  </div>
                  <div
                    className="justify-center text-neutral-400 text-sm font-semibold font-['Inter'] leading-relaxed">About
                  </div>
                </div>
              </div>
            </div>
            <div className="self-stretch flex flex-col justify-start items-start gap-4">
              <div className="self-stretch h-[0.50px] bg-zinc-800 rounded-[100px]"/>
              <div className="self-stretch p-3 rounded-[10px] inline-flex justify-between items-center">
                <div className="flex justify-start items-center gap-4">
                  <div className="w-5 h-5 relative origin-top-left rotate-180 overflow-hidden">
                    <div
                      className="w-3.5 h-3.5 left-[4.38px] top-[2.50px] absolute outline outline-[1.20px] outline-offset-[-0.60px] outline-neutral-400"/>
                  </div>
                  <div
                    className="justify-center text-neutral-400 text-sm font-semibold font-['Inter'] leading-relaxed">Logout
                  </div>
                </div>
                <div className="w-5 h-5 relative opacity-0 overflow-hidden">
                  <div
                    className="w-1.5 h-3 left-[6.88px] top-[3.75px] absolute outline outline-1 outline-offset-[-0.50px] outline-neutral-400"/>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="self-stretch h-px bg-zinc-800 rounded-[100px]"/>
      </div>
      <div className="w-[1573px] left-[317px] top-[116px] absolute inline-flex justify-start items-start gap-10">
        <div className="flex-1 px-2 flex justify-start items-start gap-14">
          <div className="flex-1 inline-flex flex-col justify-start items-start gap-5 overflow-hidden">
            <div
              className="self-stretch h-60 relative bg-gradient-to-b from-neutral-800/30 to-neutral-900/30 rounded-[30px] outline outline-1 outline-offset-[-1px] outline-neutral-700 inline-flex justify-start items-start gap-6 overflow-hidden">
              <div
                className="w-64 h-64 left-[30px] top-[147px] absolute opacity-40 bg-[radial-gradient(ellipse_50.00%_50.00%_at_50.00%_50.00%,_#D497FF_0%,_#7B21BA_100%)] rounded-full blur-[112.55px]"/>
              <div className="flex-1 px-10 py-7 flex justify-start items-start gap-10">
                <img className="w-80 h-48 rounded-2xl border border-white/20" src="https://placehold.co/310x192"/>
                <div className="flex-1 inline-flex flex-col justify-start items-start gap-5">
                  <div className="self-stretch flex flex-col justify-start items-start gap-4">
                    <div className="self-stretch flex flex-col justify-start items-start gap-3">
                      <div className="self-stretch flex flex-col justify-start items-start gap-3">
                        <div className="self-stretch flex flex-col justify-start items-start gap-1">
                          <div
                            className="self-stretch justify-start text-stone-50 text-xl font-semibold font-['Inter']">BNB
                            BOSS Academy
                          </div>
                          <div
                            className="self-stretch opacity-70 justify-start text-stone-50 text-sm font-normal font-['Inter'] leading-snug">skool.com/bnb-boss-acadamy-1078
                          </div>
                        </div>
                        <div className="self-stretch inline-flex justify-between items-center">
                          <div
                            className="w-[606px] h-11 justify-start text-stone-50 text-base font-normal font-['Inter'] leading-snug">This
                            community is where we discuss all things Airbnb. Through our 9 years of experience &
                            earnings 100K/months we are here to help you be successful!
                          </div>
                          <div className="flex justify-start items-center gap-3">
                            <div className="w-28 inline-flex flex-col justify-start items-start gap-3">
                              <div className="self-stretch flex flex-col justify-start items-start gap-1">
                                <div className="justify-start text-stone-50 text-xl font-semibold font-['Inter']">14
                                </div>
                                <div
                                  className="self-stretch opacity-70 justify-start text-stone-50 text-sm font-normal font-['Inter'] leading-snug">Members
                                </div>
                              </div>
                            </div>
                            <div className="w-28 inline-flex flex-col justify-start items-start gap-3">
                              <div className="self-stretch flex flex-col justify-start items-start gap-1">
                                <div className="justify-start text-stone-50 text-xl font-semibold font-['Inter']">0
                                </div>
                                <div
                                  className="self-stretch opacity-70 justify-start text-stone-50 text-sm font-normal font-['Inter'] leading-snug">Online
                                </div>
                              </div>
                            </div>
                            <div className="w-28 inline-flex flex-col justify-start items-start gap-3">
                              <div className="self-stretch flex flex-col justify-start items-start gap-1">
                                <div className="justify-start text-stone-50 text-xl font-semibold font-['Inter']">7
                                </div>
                                <div
                                  className="opacity-70 justify-start text-stone-50 text-sm font-normal font-['Inter'] leading-snug">Admins
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="self-stretch inline-flex justify-between items-center">
                    <div className="flex justify-start items-center gap-6">
                      <div className="max-w-[686.66px] pl-4 pr-5 py-3 rounded-lg shadow-[0px_2px_12px_0px_rgba(221,121,47,1.00)] outline outline-1 outline-offset-[-1px] outline-white flex justify-center items-center gap-2">
                        <div
                          className="justify-center text-white text-base font-medium font-['Inter'] leading-normal">Invite
                          People
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-start items-center gap-36">
                      <div className="flex justify-start items-center gap-6">
                        <div className="flex justify-start items-center gap-3">
                          <div className="w-6 h-6 relative opacity-40 overflow-hidden">
                            <div
                              className="w-5 h-5 left-[2.25px] top-[2.25px] absolute outline outline-[1.50px] outline-offset-[-0.75px] outline-white"/>
                          </div>
                          <div
                            className="justify-start text-white text-base font-normal font-['Inter'] leading-snug">Contact
                            UBC Admin team
                          </div>
                        </div>
                        <div className="flex justify-start items-center gap-3">
                          <div className="w-6 h-6 relative opacity-40 overflow-hidden">
                            <div
                              className="w-5 h-5 left-[2.25px] top-[2.25px] absolute outline outline-[1.50px] outline-offset-[-0.75px] outline-white"/>
                          </div>
                          <div
                            className="justify-start text-white text-base font-normal font-['Inter'] leading-snug">Rules
                            & Legal Pages
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="self-stretch flex flex-col justify-start items-start gap-6">
              <div className="self-stretch inline-flex justify-between items-center">
                <div className="flex justify-start items-start gap-8">
                  <div
                    className="justify-center text-fuchsia-400 text-2xl font-medium font-['Inter'] leading-relaxed">Members
                    (55 333)
                  </div>
                  <div
                    className="w-7 h-0 origin-top-left rotate-90 outline outline-1 outline-offset-[-0.50px] outline-neutral-700"/>
                  <div
                    className="justify-center text-zinc-600 text-2xl font-medium font-['Inter'] leading-relaxed">Admins
                    (23)
                  </div>
                  <div
                    className="w-7 h-0 origin-top-left rotate-90 outline outline-1 outline-offset-[-0.50px] outline-neutral-700"/>
                  <div
                    className="justify-center text-zinc-600 text-2xl font-medium font-['Inter'] leading-relaxed">Online
                    (142)
                  </div>
                </div>
                <div className="flex justify-start items-center gap-6">
                  <div className="max-w-[686.66px] pl-4 pr-5 py-3 bg-fuchsia-400 rounded-lg shadow-[0px_2px_12px_0px_rgba(221,121,47,1.00)] flex justify-center items-center gap-2">
                    <div
                      className="justify-center text-neutral-900 text-base font-bold font-['Inter'] leading-normal">Invite
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="self-stretch inline-flex justify-start items-start gap-4 flex-wrap content-start">
              <div
                className="flex-1 relative bg-gradient-to-b from-neutral-800/30 to-neutral-900/30 rounded-[30px] outline outline-1 outline-offset-[-1px] outline-neutral-700 inline-flex flex-col justify-start items-start gap-2.5 overflow-hidden">
                <div
                  className="w-64 h-64 left-[30px] top-[147px] absolute opacity-40 bg-[radial-gradient(ellipse_50.00%_50.00%_at_50.00%_50.00%,_#D497FF_0%,_#7B21BA_100%)] rounded-full blur-[112.55px]"/>
                <div className="self-stretch px-7 py-5 flex flex-col justify-start items-start gap-4">
                  <div className="self-stretch inline-flex justify-start items-center gap-5">
                    <img className="w-20 h-20 rounded-full" src="https://placehold.co/76x76"/>
                    <div className="flex-1 inline-flex flex-col justify-start items-start gap-1">
                      <div className="self-stretch inline-flex justify-start items-center gap-4">
                        <div className="justify-start text-stone-50 text-xl font-semibold font-['Inter']">Andrew
                          Kramer
                        </div>
                        <div className="flex justify-start items-center gap-2">
                          <div className="w-3 h-3 bg-green-600 rounded-full"/>
                          <div
                            className="opacity-60 justify-start text-stone-50 text-base font-normal font-['Inter'] leading-snug">Online
                          </div>
                        </div>
                      </div>
                      <div className="self-stretch inline-flex justify-start items-center gap-3">
                        <div
                          className="opacity-60 justify-start text-stone-50 text-base font-normal font-['Inter'] leading-snug">@andrew-kramer-0210
                        </div>
                        <div className="w-[5px] h-[5px] opacity-40 bg-zinc-300 rounded-full"/>
                        <div
                          className="opacity-60 justify-start text-stone-50 text-base font-normal font-['Inter'] leading-snug">Joined
                          Jun 18
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-start items-center gap-6">
                      <div
                        className="max-w-[686.66px] pl-4 pr-5 py-3 rounded-lg shadow-[0px_2px_12px_0px_rgba(221,121,47,1.00)] outline outline-1 outline-offset-[-1px] outline-fuchsia-400 flex justify-center items-center gap-2">
                        <div className="w-6 h-6 relative overflow-hidden">
                          <div
                            className="w-4 h-4 left-[3px] top-[3.75px] absolute outline outline-[1.50px] outline-offset-[-0.75px] outline-fuchsia-400"/>
                        </div>
                        <div
                          className="justify-center text-fuchsia-400 text-base font-medium font-['Inter'] leading-normal">Chat
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="self-stretch flex flex-col justify-start items-start gap-2">
                    <div
                      className="self-stretch justify-start text-stone-50 text-xl font-normal font-['Inter'] leading-loose">Hey
                      all I am mum of two who just started digital marketing to try my luck
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="self-stretch inline-flex justify-start items-start gap-4 flex-wrap content-start">
              <div
                className="flex-1 relative bg-gradient-to-b from-neutral-800/30 to-neutral-900/30 rounded-[30px] outline outline-1 outline-offset-[-1px] outline-neutral-700 inline-flex flex-col justify-start items-start gap-2.5 overflow-hidden">
                <div
                  className="w-64 h-64 left-[30px] top-[147px] absolute opacity-40 bg-[radial-gradient(ellipse_50.00%_50.00%_at_50.00%_50.00%,_#D497FF_0%,_#7B21BA_100%)] rounded-full blur-[112.55px]"/>
                <div className="self-stretch px-7 py-5 flex flex-col justify-start items-start gap-4">
                  <div className="self-stretch inline-flex justify-start items-center gap-5">
                    <img className="w-20 h-20 rounded-full" src="https://placehold.co/76x76"/>
                    <div className="flex-1 inline-flex flex-col justify-start items-start gap-1">
                      <div className="self-stretch inline-flex justify-start items-center gap-4">
                        <div className="justify-start text-stone-50 text-xl font-semibold font-['Inter']">Sana Knokhar
                        </div>
                        <div className="flex justify-start items-center gap-2">
                          <div className="w-3 h-3 bg-neutral-500 rounded-full"/>
                          <div
                            className="opacity-60 justify-start text-stone-50 text-base font-normal font-['Inter'] leading-snug">Offline
                          </div>
                        </div>
                      </div>
                      <div className="self-stretch inline-flex justify-start items-center gap-3">
                        <div className="flex-1 flex justify-start items-center gap-3">
                          <div
                            className="opacity-60 justify-start text-stone-50 text-base font-normal font-['Inter'] leading-snug">@sana-khokhar-6351
                          </div>
                          <div className="w-[5px] h-[5px] opacity-40 bg-zinc-300 rounded-full"/>
                          <div
                            className="opacity-60 justify-start text-stone-50 text-base font-normal font-['Inter'] leading-snug">Joined
                            Jun 18
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-start items-center gap-6">
                      <div
                        className="max-w-[686.66px] pl-4 pr-5 py-3 rounded-lg shadow-[0px_2px_12px_0px_rgba(221,121,47,1.00)] outline outline-1 outline-offset-[-1px] outline-fuchsia-400 flex justify-center items-center gap-2">
                        <div className="w-6 h-6 relative overflow-hidden">
                          <div
                            className="w-4 h-4 left-[3px] top-[3.75px] absolute outline outline-[1.50px] outline-offset-[-0.75px] outline-fuchsia-400"/>
                        </div>
                        <div
                          className="justify-center text-fuchsia-400 text-base font-medium font-['Inter'] leading-normal">Chat
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="self-stretch flex flex-col justify-start items-start gap-2">
                    <div
                      className="self-stretch justify-start text-stone-50 text-xl font-normal font-['Inter'] leading-loose">Empowering
                      aspiring entrepreneurs to escape the 9-5 grind, achieve financial freedom, and prioritise mental
                      health 🌟 Digital Marketing + Support
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="self-stretch inline-flex justify-start items-start gap-4 flex-wrap content-start">
              <div
                className="flex-1 relative bg-gradient-to-b from-neutral-800/30 to-neutral-900/30 rounded-[30px] outline outline-1 outline-offset-[-1px] outline-neutral-700 inline-flex flex-col justify-start items-start gap-2.5 overflow-hidden">
                <div
                  className="w-64 h-64 left-[30px] top-[147px] absolute opacity-40 bg-[radial-gradient(ellipse_50.00%_50.00%_at_50.00%_50.00%,_#D497FF_0%,_#7B21BA_100%)] rounded-full blur-[112.55px]"/>
                <div className="self-stretch px-7 py-5 flex flex-col justify-start items-start gap-4">
                  <div className="self-stretch inline-flex justify-start items-center gap-5">
                    <img className="w-20 h-20 rounded-full" src="https://placehold.co/76x76"/>
                    <div className="flex-1 inline-flex flex-col justify-start items-start gap-1">
                      <div className="self-stretch inline-flex justify-start items-center gap-4">
                        <div className="justify-start text-stone-50 text-xl font-semibold font-['Inter']">Andrew
                          Kramer
                        </div>
                        <div className="flex justify-start items-center gap-2">
                          <div className="w-3 h-3 bg-green-600 rounded-full"/>
                          <div
                            className="opacity-60 justify-start text-stone-50 text-base font-normal font-['Inter'] leading-snug">Online
                          </div>
                        </div>
                      </div>
                      <div className="self-stretch inline-flex justify-start items-center gap-3">
                        <div
                          className="opacity-60 justify-start text-stone-50 text-base font-normal font-['Inter'] leading-snug">@andrew-kramer-0210
                        </div>
                        <div className="w-[5px] h-[5px] opacity-40 bg-zinc-300 rounded-full"/>
                        <div
                          className="opacity-60 justify-start text-stone-50 text-base font-normal font-['Inter'] leading-snug">Joined
                          Jun 18
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-start items-center gap-6">
                      <div
                        className="max-w-[686.66px] pl-4 pr-5 py-3 rounded-lg shadow-[0px_2px_12px_0px_rgba(221,121,47,1.00)] outline outline-1 outline-offset-[-1px] outline-fuchsia-400 flex justify-center items-center gap-2">
                        <div className="w-6 h-6 relative overflow-hidden">
                          <div
                            className="w-4 h-4 left-[3px] top-[3.75px] absolute outline outline-[1.50px] outline-offset-[-0.75px] outline-fuchsia-400"/>
                        </div>
                        <div
                          className="justify-center text-fuchsia-400 text-base font-medium font-['Inter'] leading-normal">Chat
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="self-stretch flex flex-col justify-start items-start gap-2">
                    <div
                      className="self-stretch justify-start text-stone-50 text-xl font-normal font-['Inter'] leading-loose">Hey
                      all I am mum of two who just started digital marketing to try my luck
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="self-stretch inline-flex justify-start items-start gap-4 flex-wrap content-start">
              <div
                className="flex-1 relative bg-gradient-to-b from-neutral-800/30 to-neutral-900/30 rounded-[30px] outline outline-1 outline-offset-[-1px] outline-neutral-700 inline-flex flex-col justify-start items-start gap-2.5 overflow-hidden">
                <div
                  className="w-64 h-64 left-[30px] top-[147px] absolute opacity-40 bg-[radial-gradient(ellipse_50.00%_50.00%_at_50.00%_50.00%,_#D497FF_0%,_#7B21BA_100%)] rounded-full blur-[112.55px]"/>
                <div className="self-stretch px-7 py-5 flex flex-col justify-start items-start gap-4">
                  <div className="self-stretch inline-flex justify-start items-center gap-5">
                    <img className="w-20 h-20 rounded-full" src="https://placehold.co/76x76"/>
                    <div className="flex-1 inline-flex flex-col justify-start items-start gap-1">
                      <div className="self-stretch inline-flex justify-start items-center gap-4">
                        <div className="justify-start text-stone-50 text-xl font-semibold font-['Inter']">Sana Knokhar
                        </div>
                        <div className="flex justify-start items-center gap-2">
                          <div className="w-3 h-3 bg-neutral-500 rounded-full"/>
                          <div
                            className="opacity-60 justify-start text-stone-50 text-base font-normal font-['Inter'] leading-snug">Offline
                          </div>
                        </div>
                      </div>
                      <div className="self-stretch inline-flex justify-start items-center gap-3">
                        <div className="flex-1 flex justify-start items-center gap-3">
                          <div
                            className="opacity-60 justify-start text-stone-50 text-base font-normal font-['Inter'] leading-snug">@sana-khokhar-6351
                          </div>
                          <div className="w-[5px] h-[5px] opacity-40 bg-zinc-300 rounded-full"/>
                          <div
                            className="opacity-60 justify-start text-stone-50 text-base font-normal font-['Inter'] leading-snug">Joined
                            Jun 18
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-start items-center gap-6">
                      <div
                        className="max-w-[686.66px] pl-4 pr-5 py-3 rounded-lg shadow-[0px_2px_12px_0px_rgba(221,121,47,1.00)] outline outline-1 outline-offset-[-1px] outline-fuchsia-400 flex justify-center items-center gap-2">
                        <div className="w-6 h-6 relative overflow-hidden">
                          <div
                            className="w-4 h-4 left-[3px] top-[3.75px] absolute outline outline-[1.50px] outline-offset-[-0.75px] outline-fuchsia-400"/>
                        </div>
                        <div
                          className="justify-center text-fuchsia-400 text-base font-medium font-['Inter'] leading-normal">Chat
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="self-stretch flex flex-col justify-start items-start gap-2">
                    <div
                      className="self-stretch justify-start text-stone-50 text-xl font-normal font-['Inter'] leading-loose">Empowering
                      aspiring entrepreneurs to escape the 9-5 grind, achieve financial freedom, and prioritise mental
                      health 🌟 Digital Marketing + Support
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MembersPage;
