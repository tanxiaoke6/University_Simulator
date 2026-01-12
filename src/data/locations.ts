
import { ActionType } from '../types';
import {
    Library,
    Coffee,
    Dumbbell,
    Home,
    BookOpen,
    FlaskConical,
    Building2,
    Store,
    Tent,
    Languages,
    Briefcase,
} from 'lucide-react';


export type LocationCategory = 'academic' | 'living' | 'off_campus';

export interface LocationAction {
    type: ActionType;
    label: string;
    cost: number;
    stamina: number;
    desc: string;
    bonus?: string;
}

export interface Location {
    id: string;
    name: string;
    description: string;
    category: LocationCategory;
    icon: any; // Lucide icon
    color: string;
    actions: LocationAction[];
}

export const LOCATIONS: Location[] = [
    // Academic Zone
    {
        id: 'library',
        name: '中央图书馆',
        description: '安静的自习室，最适合提升学习成绩。这里也有勤工助学的岗位发布。',
        category: 'academic',
        icon: Library,
        color: 'primary',
        actions: [
            { type: 'study', label: '深度学习', cost: 1, stamina: -20, desc: '专注研究学术问题。', bonus: 'GPA/IQ +' },
        ]
    },
    {
        id: 'classroom',
        name: '公共教学楼',
        description: '明亮的教室与阶梯教室，是知识交汇的殿堂。',
        category: 'academic',
        icon: BookOpen,
        color: 'blue',
        actions: [
            { type: 'study', label: '参加讲座', cost: 1, stamina: -15, desc: '听取教授的精彩演讲。', bonus: 'IQ/GPA +' },
            { type: 'study', label: '自习钻研', cost: 1, stamina: -20, desc: '独自攻克学术难题。', bonus: '智力/知识点 +' },
            { type: 'socialize', label: '课间交流', cost: 1, stamina: -5, desc: '与隔壁班同学聊聊八卦。', bonus: '情商提升' },
        ]
    },
    {
        id: 'innovation_lab',
        name: '创新实验室',
        description: '充满科技感的实验室，适合进行科研竞赛和项目开发。',
        category: 'academic',
        icon: FlaskConical,
        color: 'indigo',
        actions: [
            { type: 'study', label: '撰写论文', cost: 1, stamina: -25, desc: '专注于学术论文的撰写与修改。', bonus: '学术声望 +' },
            { type: 'study', label: '备战竞赛', cost: 1, stamina: -20, desc: '为即将到来的学科竞赛做准备。', bonus: 'IQ/技能 +' },
        ]
    },
    {
        id: 'admin_building',
        name: '行政楼',
        description: '处理学校行政事务的地方，也是学生会开展活动的大本营。',
        category: 'academic',
        icon: Building2,
        color: 'slate',
        actions: [
            { type: 'pay_fees', label: '缴纳学费', cost: 1, stamina: 0, desc: '缴纳本学期的学杂费。', bonus: '金钱 -' },
        ]
    },
    {
        id: 'language_center',
        name: '国际语言中心',
        description: '连接世界的窗口，语言考证与跨文化交流的核心场所。',
        category: 'academic',
        icon: Languages,
        color: 'cyan',
        actions: [
            { type: 'socialize', label: '口语角练习', cost: 1, stamina: -10, desc: '与外教和留学生进行英语对话练习。', bonus: '魅力/EQ +' },
            { type: 'study', label: '全真模考', cost: 1, stamina: -25, desc: '参加四六级/雅思模拟考试，冲刺备考。', bonus: '考证进度 ++' },
        ]
    },


    // Living Zone
    {
        id: 'dorm',
        name: '学生宿舍',
        description: '你的温馨避风港，可以放松休息或社交。',
        category: 'living',
        icon: Home,
        color: 'purple',
        actions: [
            { type: 'relax', label: '深度睡眠', cost: 1, stamina: 40, desc: '彻底恢复精神。', bonus: '压力 -20' },
            { type: 'socialize', label: '宿舍夜谈', cost: 1, stamina: -10, desc: '与室友增进感情。', bonus: '人际关系 +' },
        ]
    },
    {
        id: 'cafeteria',
        name: '学生生活区',
        description: '提供美食享受与日常购物，是休息和补给的绝佳选择。',
        category: 'living',
        icon: Coffee,
        color: 'orange',
        actions: [
            { type: 'relax', label: '悠闲午餐', cost: 1, stamina: 15, desc: '享用一顿美餐，恢复少量体力。', bonus: '不计步数' },
        ]
    },
    {
        id: 'gym',
        name: '体育馆',
        description: '充满汗水和激情的运动场馆。',
        category: 'living',
        icon: Dumbbell,
        color: 'green',
        actions: [
            { type: 'exercise', label: '器械训练', cost: 1, stamina: -15, desc: '锻炼身体，提升魅力。', bonus: '体力上限 +2' },
        ]
    },
    {
        id: 'lake_side',
        name: '未名湖畔',
        description: '校园里最浪漫静谧的角落，适合思考人生或约会。',
        category: 'living',
        icon: Tent,
        color: 'teal',
        actions: [
            { type: 'relax', label: '湖边散步', cost: 1, stamina: 10, desc: '吹吹晚风，放松心情。', bonus: '压力 -20' },
        ]
    },

    // Off-Campus
    {
        id: 'commercial_street',
        name: '校外商业街',
        description: '繁华热闹的商业中心，充满了诱惑与机遇。',
        category: 'off_campus',
        icon: Store,
        color: 'pink',
        actions: [
            { type: 'socialize', label: '看电影', cost: 1, stamina: -5, desc: '去影院看一场最新上映的大片。', bonus: '压力 -15' },
            { type: 'socialize', label: '咖啡探店', cost: 1, stamina: -5, desc: '打卡网红咖啡馆。', bonus: '魅力 +' },
        ]
    },
    {
        id: 'tech_park',
        name: '高新科技园',
        description: '汇聚创新企业与实习机会的前沿阵地，职业发展的起点。',
        category: 'off_campus',
        icon: Briefcase,
        color: 'sky',
        actions: [
            { type: 'socialize', label: '企业开放日', cost: 1, stamina: -15, desc: '参观知名企业，拓宽眼界与人脉。', bonus: '就业力 +' },
            { type: 'study', label: '技能培训班', cost: 1, stamina: -20, desc: '参加职业技能认证的培训课程。', bonus: '证书进度 ++' },
        ]
    },
];

