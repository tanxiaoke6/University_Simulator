import { useGameStore } from '../../../stores/gameStore';
import { usePhoneStore } from '../../../stores/phoneStore';
import { CERTIFICATES } from '../../../data/certificates';
import { ChevronLeft, Scroll, Trophy, Microscope, Award, PlayCircle } from 'lucide-react';

export default function CertApp() {
    const { closeApp } = usePhoneStore();
    const { student } = useGameStore();

    if (!student) return null;

    const ownedCerts = student.certificates || [];
    const activeProjects = student.activeProjects || [];

    // Filter certificates that the student owns
    const myCerts = CERTIFICATES.filter(c => ownedCerts.includes(c.id));

    return (
        <div className="flex flex-col h-full bg-slate-50 text-slate-900 animate-fade-in pb-12">
            {/* Header */}
            <header className="p-4 bg-white shadow-sm flex items-center gap-3 sticky top-0 z-10">
                <button onClick={closeApp} className="p-1 -ml-1 hover:bg-slate-100 rounded-full transition-colors">
                    <ChevronLeft className="w-5 h-5 text-slate-600" />
                </button>
                <div className="flex items-center gap-2">
                    <Award className="w-4 h-4 text-primary-600" />
                    <h2 className="font-bold text-sm text-slate-800">荣誉证书</h2>
                </div>
            </header>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">

                {/* Active Projects Section - Show progress for ongoing items */}
                {activeProjects.length > 0 && (
                    <section className="space-y-2">
                        <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1">进行中</h3>
                        <div className="space-y-2 max-h-56 overflow-y-auto no-scrollbar pb-2">
                            {activeProjects.map(proj => {
                                const progressPercent = Math.min(100, (proj.currentProgress / proj.maxProgress) * 100);
                                return (
                                    <div key={proj.id} className="bg-white p-3 rounded-xl shadow-sm border border-primary-200">
                                        <div className="flex items-center gap-2 mb-2">
                                            <PlayCircle className="w-4 h-4 text-primary-500" />
                                            <span className="font-bold text-xs text-slate-800">{proj.name}</span>
                                            <span className="ml-auto text-[10px] font-mono text-primary-600">
                                                {progressPercent.toFixed(0)}%
                                            </span>
                                        </div>
                                        <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-primary-500 transition-all duration-300"
                                                style={{ width: `${progressPercent}%` }}
                                            />
                                        </div>
                                        <p className="text-[9px] text-slate-400 mt-1.5">前往图书馆/实验室进行学习以推进进度</p>
                                    </div>
                                );
                            })}
                        </div>
                    </section>
                )}

                {/* Owned Certificates Section */}
                <section className="space-y-2">
                    <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1">已获得</h3>
                    {myCerts.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-40 text-slate-400 bg-white rounded-xl border border-slate-200">
                            <Award className="w-10 h-10 mb-2 opacity-50" />
                            <p className="text-xs">暂无荣誉证书</p>
                            <p className="text-[10px] mt-1">前往【自我提升】获取</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-2">
                            {myCerts.map(cert => (
                                <div key={cert.id} className="bg-white p-3 rounded-xl shadow-sm border border-slate-200">
                                    <div className="flex items-start gap-3">
                                        <div className={`p-2 rounded-lg 
                                            ${cert.category === 'competition' ? 'bg-amber-100 text-amber-600' :
                                                cert.category === 'research' ? 'bg-purple-100 text-purple-600' :
                                                    'bg-emerald-100 text-emerald-600'}`}>
                                            {cert.category === 'competition' ? <Trophy className="w-4 h-4" /> :
                                                cert.category === 'research' ? <Microscope className="w-4 h-4" /> :
                                                    <Scroll className="w-4 h-4" />}
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-bold text-xs text-slate-800">{cert.name}</h3>
                                            <p className="text-[9px] text-slate-500 mt-0.5 line-clamp-2">
                                                {cert.description}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
}
