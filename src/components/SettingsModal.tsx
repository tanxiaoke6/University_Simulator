// Settings Modal Component - Iteration 3
import { useState } from 'react';
import { useGameStore } from '../stores/gameStore';
import {
    X,
    Save,
    Database,
    Trash2,
    Upload,
    Download,
    Check,
    RotateCcw,
    Sparkles,
    Cpu,
    RefreshCw,
    Terminal,
    Unlock,
    Edit2,
} from 'lucide-react';
import { testLLMConnection } from '../services/aiService';

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
    const { student, config, setConfig, resetGame, exportSave, importSave, updateStudent } = useGameStore();

    const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
    const [testMessage, setTestMessage] = useState('');
    const [importJson, setImportJson] = useState('');
    const [copyFeedback, setCopyFeedback] = useState(false);
    const [showImportArea, setShowImportArea] = useState(false);

    // Developer Mode State
    const [showDevAuth, setShowDevAuth] = useState(false);
    const [devPassword, setDevPassword] = useState('');
    const [isDevUnlocked, setIsDevUnlocked] = useState(false);
    const [devError, setDevError] = useState('');

    // Dev Edit State
    const [editingAttr, setEditingAttr] = useState<string | null>(null);

    if (!isOpen) return null;

    const handleTestConnection = async () => {
        setTestStatus('testing');
        const result = await testLLMConnection(config.llm);
        if (result.success) {
            setTestStatus('success');
            setTestMessage('连接成功！API 工作正常。');
        } else {
            setTestStatus('error');
            setTestMessage(result.error || '连接失败，请检查配置。');
        }
    };

    const handleExport = () => {
        const json = exportSave();
        navigator.clipboard.writeText(json);
        setCopyFeedback(true);
        setTimeout(() => setCopyFeedback(false), 2000);
    };

    const handleImport = () => {
        const success = importSave(importJson);
        if (success) {
            alert('存档导入成功！');
            setShowImportArea(false);
            setImportJson('');
            onClose();
        } else {
            alert('存档格式无效，请检查 JSON 字符串。');
        }
    };

    const handleReset = () => {
        if (confirm('确定要重置所有游戏数据吗？此操作不可逆。')) {
            resetGame();
            onClose();
        }
    };

    const handleReplayTutorial = () => {
        localStorage.removeItem('university-simulator-tutorial-completed');
        alert('教程已重置。下次进入游戏将显示新手引导。');
        onClose();
    };

    const handleDevAuth = async () => {
        try {
            const response = await fetch('/llm_api_config.json');
            const data = await response.json();
            if (data.dev_password && devPassword === data.dev_password) {
                setIsDevUnlocked(true);
                setDevError('');
                setShowDevAuth(false);
            } else {
                setDevError('密码错误');
            }
        } catch (e) {
            setDevError('无法验证密码');
        }
    };
    const handleUpdateAttribute = (attr: string, value: number) => {
        if (!student) return;

        // Create updated attributes object
        const updatedAttributes = {
            ...student.attributes,
            [attr]: value
        };

        updateStudent({ attributes: updatedAttributes });
        setEditingAttr(null);
    };

    const handleUpdateMoney = (value: number) => {
        if (!student) return;
        updateStudent({
            money: value,
            wallet: { ...student.wallet, balance: value }
        });
        setEditingAttr(null);
    };

    const handleUpdateWealth = (wealth: 'wealthy' | 'middle' | 'poor') => {
        if (!student) return;
        updateStudent({
            family: {
                ...student.family,
                wealth: wealth
            }
        });
    };

    const handleUpdateGPA = (value: number) => {
        if (!student) return;
        const clampedValue = Math.max(0, Math.min(4, value)); // GPA 0-4 range
        updateStudent({
            academic: {
                ...student.academic,
                gpa: clampedValue
            }
        });
        setEditingAttr(null);
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-dark-950/80 backdrop-blur-md" onClick={onClose} />

            {/* Container */}
            <div className="relative glass-card w-full max-w-2xl max-h-[90vh] flex flex-col animate-scale-in">
                {/* Header */}
                <header className="p-6 border-b border-dark-800/50 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary-500/20 flex items-center justify-center text-primary-400">
                            <Database className="w-6 h-6" />
                        </div>
                        <h2 className="text-2xl font-display font-bold">系统设置</h2>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-dark-800 rounded-lg transition-colors cursor-pointer">
                        <X className="w-6 h-6 text-dark-500" />
                    </button>
                </header>

                {/* Content - Scrollable */}
                <div className="flex-1 overflow-y-auto p-6 space-y-8 scrollbar-thin">
                    {/* AI Configuration */}
                    <section className="space-y-4">
                        <div className="flex items-center gap-2 mb-4">
                            <Cpu className="w-5 h-5 text-accent-400" />
                            <h3 className="text-lg font-bold">AI 模型配置</h3>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="input-label">提供商</label>
                                <select
                                    value={config.llm.provider}
                                    onChange={(e) => setConfig({ llm: { ...config.llm, provider: e.target.value as any } })}
                                    className="input-field"
                                >
                                    <option value="openai">OpenAI</option>
                                    <option value="gemini">Google Gemini</option>
                                    <option value="claude">Anthropic Claude</option>
                                    <option value="custom">自定义 URL</option>
                                </select>
                            </div>
                            <div>
                                <label className="input-label">模型名称</label>
                                <input
                                    type="text"
                                    value={config.llm.model}
                                    onChange={(e) => setConfig({ llm: { ...config.llm, model: e.target.value } })}
                                    placeholder="如 gpt-3.5-turbo"
                                    className="input-field"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="input-label">API Key</label>
                            <input
                                type="password"
                                value={config.llm.apiKey}
                                onChange={(e) => setConfig({ llm: { ...config.llm, apiKey: e.target.value } })}
                                placeholder="sk-..."
                                className="input-field"
                            />
                        </div>

                        <div>
                            <label className="input-label">API Base URL</label>
                            <input
                                type="text"
                                value={config.llm.baseUrl}
                                onChange={(e) => setConfig({ llm: { ...config.llm, baseUrl: e.target.value } })}
                                placeholder="https://api.openai.com/v1"
                                className="input-field"
                            />
                            <p className="text-[10px] text-dark-500 mt-1">
                                自定义接口地址。默认为 OpenAI (https://api.openai.com/v1)
                            </p>
                        </div>

                        <div className="flex items-center gap-3">
                            <button
                                onClick={handleTestConnection}
                                disabled={testStatus === 'testing' || !config.llm.apiKey}
                                className="action-btn-secondary py-2 text-sm"
                            >
                                {testStatus === 'testing' ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                                测试连接
                            </button>
                            {testStatus !== 'idle' && (
                                <span className={`text-xs ${testStatus === 'success' ? 'text-green-400' : 'text-red-400'}`}>
                                    {testMessage}
                                </span>
                            )}
                        </div>
                    </section>

                    {/* Data Management */}
                    <section className="space-y-4 pt-6 border-t border-dark-800/50">
                        <div className="flex items-center gap-2 mb-4">
                            <Save className="w-5 h-5 text-primary-400" />
                            <h3 className="text-lg font-bold">存档与数据</h3>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <button onClick={handleExport} className="action-btn-secondary justify-center py-3">
                                {copyFeedback ? <Check className="w-4 h-4 text-green-400" /> : <Download className="w-4 h-4" />}
                                {copyFeedback ? '已复制 JSON' : '导出存档'}
                            </button>

                            <button onClick={() => setShowImportArea(!showImportArea)} className="action-btn-secondary justify-center py-3">
                                <Upload className="w-4 h-4" />
                                导入存档
                            </button>
                        </div>

                        {showImportArea && (
                            <div className="space-y-3 animate-fade-in">
                                <textarea
                                    value={importJson}
                                    onChange={(e) => setImportJson(e.target.value)}
                                    placeholder="在此粘贴导出的 JSON 存档字符串..."
                                    className="w-full h-32 bg-dark-900 border border-dark-700 rounded-xl p-4 text-xs font-mono text-dark-300 focus:border-primary-500 focus:outline-none scrollbar-thin"
                                />
                                <button
                                    onClick={handleImport}
                                    disabled={!importJson.trim()}
                                    className="action-btn-primary w-full justify-center disabled:opacity-50"
                                >
                                    确认导入
                                </button>
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-3">
                            <button onClick={handleReplayTutorial} className="action-btn-secondary justify-center border-accent-500/30 text-accent-400">
                                <RotateCcw className="w-4 h-4" />
                                重置教程
                            </button>

                            <button onClick={handleReset} className="action-btn-secondary justify-center border-red-500/30 text-red-500 hover:bg-red-500/10">
                                <Trash2 className="w-4 h-4" />
                                删除存档
                            </button>
                        </div>
                    </section>

                    {/* Preferences */}
                    <section className="space-y-4 pt-6 border-t border-dark-800/50">
                        <div className="flex items-center justify-between p-4 bg-dark-800/50 rounded-xl border border-dark-700">
                            <span className="text-sm font-medium">自动保存</span>
                            <button
                                onClick={() => setConfig({ autoSave: !config.autoSave })}
                                className={`w-12 h-6 rounded-full p-1 transition-colors ${config.autoSave ? 'bg-primary-600' : 'bg-dark-600'}`}
                            >
                                <div className={`w-4 h-4 bg-white rounded-full transition-transform ${config.autoSave ? 'translate-x-6' : 'translate-x-0'}`} />
                            </button>
                        </div>
                    </section>

                    {/* Developer Options */}
                    <section className="space-y-4 pt-6 border-t border-dark-800/50">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Terminal className="w-5 h-5 text-dark-400" />
                                <h3 className="text-lg font-bold text-dark-300">开发者选项</h3>
                            </div>
                            {!isDevUnlocked ? (
                                <button
                                    onClick={() => setShowDevAuth(!showDevAuth)}
                                    className="text-xs text-dark-500 hover:text-primary-400 transition-colors uppercase font-bold tracking-wider"
                                >
                                    Enable Dev Mode
                                </button>
                            ) : (
                                <span className="text-xs text-green-500 font-bold flex items-center gap-1">
                                    <Unlock className="w-3 h-3" />
                                    已解锁
                                </span>
                            )}
                        </div>

                        {showDevAuth && !isDevUnlocked && (
                            <div className="flex gap-2 animate-fade-in">
                                <input
                                    type="password"
                                    value={devPassword}
                                    onChange={(e) => setDevPassword(e.target.value)}
                                    placeholder="输入开发者密码..."
                                    className="input-field py-1"
                                />
                                <button onClick={handleDevAuth} className="action-btn-primary whitespace-nowrap">
                                    验证
                                </button>
                            </div>
                        )}
                        {devError && <p className="text-xs text-red-500">{devError}</p>}

                        {isDevUnlocked && (
                            <div className="space-y-4 animate-scale-in bg-dark-900/50 p-4 rounded-xl border border-primary-500/20">
                                <div className="grid grid-cols-2 gap-4">
                                    {/* Money */}
                                    <div className="p-3 bg-dark-800 rounded-lg flex items-center justify-between">
                                        <div>
                                            <p className="text-[10px] text-dark-500 uppercase">金钱</p>
                                            {editingAttr === 'money' ? (
                                                <input
                                                    autoFocus
                                                    type="number"
                                                    className="w-20 bg-dark-900 text-white text-xs p-1 rounded border border-primary-500"
                                                    defaultValue={student?.money}
                                                    onBlur={(e) => handleUpdateMoney(parseInt(e.target.value))}
                                                    onKeyDown={(e: any) => e.key === 'Enter' && handleUpdateMoney(parseInt(e.currentTarget.value))}
                                                />
                                            ) : (
                                                <p className="font-mono font-bold text-green-400">¥{student?.money}</p>
                                            )}
                                        </div>
                                        <button onClick={() => setEditingAttr('money')}><Edit2 className="w-4 h-4 text-dark-500 hover:text-primary-400" /></button>
                                    </div>

                                    {/* Wealth */}
                                    <div className="p-3 bg-dark-800 rounded-lg">
                                        <p className="text-[10px] text-dark-500 uppercase mb-1">家庭背景</p>
                                        <select
                                            className="w-full bg-dark-900 text-xs text-white p-1 rounded border border-dark-700 focus:border-primary-500 outline-none"
                                            value={student?.family.wealth}
                                            onChange={(e) => handleUpdateWealth(e.target.value as any)}
                                        >
                                            <option value="wealthy">富裕 (Wealthy)</option>
                                            <option value="middle">中产 (Middle)</option>
                                            <option value="poor">贫困 (Poor)</option>
                                        </select>
                                    </div>

                                    {/* GPA */}
                                    <div className="p-3 bg-dark-800 rounded-lg flex items-center justify-between">
                                        <div>
                                            <p className="text-[10px] text-dark-500 uppercase">GPA</p>
                                            {editingAttr === 'gpa' ? (
                                                <input
                                                    autoFocus
                                                    type="number"
                                                    step="0.01"
                                                    min="0"
                                                    max="4"
                                                    className="w-20 bg-dark-900 text-white text-xs p-1 rounded border border-primary-500"
                                                    defaultValue={student?.academic.gpa.toFixed(2)}
                                                    onBlur={(e) => handleUpdateGPA(parseFloat(e.target.value))}
                                                    onKeyDown={(e: any) => e.key === 'Enter' && handleUpdateGPA(parseFloat(e.currentTarget.value))}
                                                />
                                            ) : (
                                                <p className="font-mono font-bold text-yellow-400">{student?.academic.gpa.toFixed(2)}</p>
                                            )}
                                        </div>
                                        <button onClick={() => setEditingAttr('gpa')}><Edit2 className="w-4 h-4 text-dark-500 hover:text-primary-400" /></button>
                                    </div>

                                    {/* Attributes */}
                                    {['iq', 'eq', 'stamina', 'stress', 'charm', 'luck', 'employability'].map((attr) => (
                                        <div key={attr} className="p-3 bg-dark-800 rounded-lg flex items-center justify-between">
                                            <div>
                                                <p className="text-[10px] text-dark-500 uppercase">{attr}</p>
                                                {editingAttr === attr ? (
                                                    <input
                                                        autoFocus
                                                        type="number"
                                                        className="w-20 bg-dark-900 text-white text-xs p-1 rounded border border-primary-500"
                                                        defaultValue={((student?.attributes as any) || {})[attr] || 0}
                                                        onBlur={(e) => handleUpdateAttribute(attr, parseInt(e.target.value))}
                                                        onKeyDown={(e: any) => e.key === 'Enter' && handleUpdateAttribute(attr, parseInt(e.currentTarget.value))}
                                                    />
                                                ) : (
                                                    <p className="font-mono font-bold text-blue-400">{((student?.attributes as any) || {})[attr] || 0}</p>
                                                )}
                                            </div>
                                            <button onClick={() => setEditingAttr(attr)}><Edit2 className="w-4 h-4 text-dark-500 hover:text-primary-400" /></button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </section>
                </div>

                {/* Footer */}
                <footer className="p-6 border-t border-dark-800/50 flex justify-end shrink-0">
                    <button onClick={onClose} className="action-btn-primary px-8">
                        完成
                    </button>
                </footer>
            </div>
        </div>
    );
}
