import { useGameStore } from '../stores/gameStore';
import { CERTIFICATES } from '../data/certificates';
import {
    GraduationCap,
    ShieldCheck,
    Brain,
    CheckCircle2,
    XCircle,
} from 'lucide-react';

export default function StudentAffairs() {
    const { student, registerForExam } = useGameStore();

    if (!student) return null;

    const pendingExams = student.pendingExams || [];
    const ownedCerts = student.certificates || [];

    return (
        <div className="flex flex-col h-full space-y-6 animate-fade-in p-2">

            {/* Section 2: Certificate & Honors Wall */}
            <div className="glass-card p-6 bg-dark-900/40 border-dark-800 shadow-xl relative overflow-hidden group">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 rounded-lg bg-amber-500/20 text-amber-500">
                        <GraduationCap className="w-5 h-5" />
                    </div>
                    <h2 className="text-sm font-bold uppercase tracking-wider text-dark-200">荣誉与证件 (Certificates & Honors)</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Left Column: My Certs & Pending */}
                    <div className="space-y-6">
                        <div>
                            <h3 className="text-[10px] font-bold text-dark-500 uppercase tracking-widest mb-3 px-1">已获得的证件</h3>
                            {ownedCerts.length === 0 ? (
                                <p className="text-xs text-dark-600 italic p-4 bg-dark-800/20 rounded-lg border border-dark-800/50">暂未获得任何证书</p>
                            ) : (
                                <div className="grid grid-cols-2 gap-2">
                                    {ownedCerts.map(certId => {
                                        const cert = CERTIFICATES.find(c => c.id === certId);
                                        if (!cert) return null;
                                        return (
                                            <div key={certId} className="flex flex-col items-center gap-2 p-3 bg-primary-500/5 border border-primary-500/20 rounded-xl text-center">
                                                <div className="p-2 rounded-full bg-primary-500/10 text-primary-400">
                                                    <ShieldCheck className="w-6 h-6" />
                                                </div>
                                                <span className="text-[10px] font-bold text-primary-200 leading-tight">{cert.name}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {pendingExams.length > 0 && (
                            <div>
                                <h3 className="text-[10px] font-bold text-dark-500 uppercase tracking-widest mb-3 px-1">正在审核中</h3>
                                <div className="space-y-2">
                                    {pendingExams.map(exam => {
                                        const currentWeekIndex = (student.currentDate.year - 1) * 40 + (student.currentDate.semester - 1) * 20 + student.currentDate.week;
                                        const remainingWeeks = exam.finishWeek - currentWeekIndex;
                                        const totalWeeks = exam.finishWeek - exam.startWeek;
                                        const progress = ((totalWeeks - remainingWeeks) / totalWeeks) * 100;

                                        return (
                                            <div key={exam.certId} className="p-3 bg-dark-800/40 rounded-xl border border-dark-700">
                                                <div className="flex justify-between items-center mb-2">
                                                    <span className="text-xs font-bold text-dark-200">{exam.name}</span>
                                                    <span className="text-[10px] text-primary-400 font-mono">剩余 {remainingWeeks} 周</span>
                                                </div>
                                                <div className="h-1.5 bg-dark-700 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-primary-500 transition-all duration-1000"
                                                        style={{ width: `${Math.max(5, progress)}%` }}
                                                    />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right Column: Available Registrations */}
                    <div>
                        <h3 className="text-[10px] font-bold text-dark-500 uppercase tracking-widest mb-3 px-1">可参与的考试</h3>
                        <div className="space-y-2 max-h-[300px] overflow-y-auto scrollbar-thin pr-2">
                            {CERTIFICATES.filter(c => {
                                // 1. Check ownership
                                if (ownedCerts.includes(c.id) || pendingExams.some(e => e.certId === c.id)) return false;
                                // 2. Check major eligibility (if specified)
                                if (c.majors && !c.majors.includes(student.academic.major.id)) return false;
                                return true;
                            }).map(cert => {
                                const meetsStats = cert.reqStats.every(req => {
                                    if (req.type === 'attribute') {
                                        const val = (student.attributes as any)[req.target] || (student.academic as any)[req.target] || 0;
                                        return val >= req.value;
                                    }
                                    return true;
                                });
                                const canAfford = student.wallet.balance >= cert.cost;

                                return (
                                    <div key={cert.id} className={`p-3 rounded-xl border transition-all ${meetsStats ? 'bg-dark-800/40 border-dark-700 hover:border-primary-500/30' : 'bg-dark-900/20 border-dark-800 opacity-60'}`}>
                                        <div className="flex justify-between items-start mb-2">
                                            <div className="flex gap-2">
                                                <div className={`p-1.5 rounded-lg ${cert.category === 'Skill' ? 'bg-blue-500/10 text-blue-400' : 'bg-amber-500/10 text-amber-400'}`}>
                                                    {cert.category === 'Skill' ? <Brain className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
                                                </div>
                                                <div>
                                                    <h4 className="text-xs font-bold text-dark-200">{cert.name}</h4>
                                                    <p className="text-[9px] text-dark-500 mt-0.5 line-clamp-1">{cert.description}</p>
                                                </div>
                                            </div>
                                            {cert.cost > 0 && <span className="text-xs font-mono font-bold text-amber-400">¥{cert.cost}</span>}
                                        </div>

                                        <div className="flex items-center justify-between mt-3">
                                            <div className="flex flex-wrap gap-2">
                                                {cert.reqStats.map((req, i) => {
                                                    const val = (student.attributes as any)[req.target] || (student.academic as any)[req.target] || 0;
                                                    const met = val >= req.value;
                                                    return (
                                                        <div key={i} className={`flex items-center gap-1 text-[8px] font-bold px-1.5 py-0.5 rounded-md ${met ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                                                            {met ? <CheckCircle2 className="w-2.5 h-2.5" /> : <XCircle className="w-2.5 h-2.5" />}
                                                            {req.target.toUpperCase()} {req.value}
                                                        </div>
                                                    );
                                                })}
                                            </div>

                                            {meetsStats && canAfford && cert.cost > 0 && (
                                                <button
                                                    onClick={() => registerForExam(cert.id)}
                                                    className="px-3 py-1 rounded-lg bg-primary-600 text-white text-[10px] font-bold hover:bg-primary-500 transition-all"
                                                >
                                                    报名
                                                </button>
                                            )}
                                            {cert.cost === 0 && meetsStats && (
                                                <span className="text-[10px] font-bold text-green-400 italic">自动授予</span>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
