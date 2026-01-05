'use client';

import { Shield, Eye, Lock, UserCheck } from 'lucide-react';
import Link from 'next/link';

export default function PrivacyPolicy() {
    return (
        <div className="min-h-screen bg-dark text-white py-20">
            <div className="container mx-auto px-4 max-w-4xl">
                {/* Header */}
                <div className="text-center mb-16 animate-reveal">
                    <div className="w-20 h-20 bg-gradient-to-br from-primary to-primary-glow rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-primary/20">
                        <Shield className="w-10 h-10 text-white" />
                    </div>
                    <h1 className="text-4xl font-black mb-4">سياسة الخصوصية</h1>
                    <p className="text-gray-400 text-lg">آخر تحديث: يناير 2026</p>
                </div>

                {/* Content */}
                <div className="glass-card p-8 md:p-12 rounded-[40px] space-y-8 animate-reveal">
                    {/* Introduction */}
                    <section>
                        <h2 className="text-2xl font-bold mb-4 text-primary">مقدمة</h2>
                        <p className="text-gray-300 leading-relaxed">
                            نلتزم في أكاديمية البشائر لكرة القدم بحماية خصوصية بياناتك الشخصية. توضح هذه السياسة كيف نقوم بجمع واستخدام وحماية معلوماتك عند استخدامك لموقعنا الإلكتروني وخدماتنا.
                        </p>
                    </section>

                    {/* Data Collection */}
                    <section className="border-t border-white/10 pt-8">
                        <div className="flex items-center gap-3 mb-4">
                            <Eye className="w-6 h-6 text-secondary" />
                            <h2 className="text-2xl font-bold text-secondary">البيانات التي نجمعها</h2>
                        </div>
                        <div className="space-y-4 text-gray-300">
                            <div>
                                <h3 className="font-bold text-white mb-2">المعلومات الشخصية:</h3>
                                <ul className="list-disc list-inside space-y-2 mr-4">
                                    <li>الاسم الكامل</li>
                                    <li>تاريخ الميلاد</li>
                                    <li>رقم الهاتف</li>
                                    <li>البريد الإلكتروني</li>
                                    <li>العنوان</li>
                                </ul>
                            </div>
                            <div>
                                <h3 className="font-bold text-white mb-2">معلومات اللاعب:</h3>
                                <ul className="list-disc list-inside space-y-2 mr-4">
                                    <li>الصور الشخصية</li>
                                    <li>معلومات اللياقة البدنية</li>
                                    <li>المراكز الرياضية</li>
                                    <li>سجل التدريب</li>
                                </ul>
                            </div>
                        </div>
                    </section>

                    {/* Data Usage */}
                    <section className="border-t border-white/10 pt-8">
                        <div className="flex items-center gap-3 mb-4">
                            <Lock className="w-6 h-6 text-primary" />
                            <h2 className="text-2xl font-bold text-primary">استخدام البيانات</h2>
                        </div>
                        <p className="text-gray-300 leading-relaxed mb-4">
                            نستخدم معلوماتك للأغراض التالية:
                        </p>
                        <ul className="list-disc list-inside space-y-2 text-gray-300 mr-4">
                            <li>إدارة التسجيلات والاشتراكات</li>
                            <li>التواصل معك بشأن البرامج التدريبية</li>
                            <li>تحسين خدماتنا وبرامجنا التدريبية</li>
                            <li>عرض صور ومعلومات اللاعبين على الموقع الإلكتروني</li>
                            <li>إرسال تحديثات وأخبار عن الأكاديمية</li>
                        </ul>
                    </section>

                    {/* Data Protection */}
                    <section className="border-t border-white/10 pt-8">
                        <div className="flex items-center gap-3 mb-4">
                            <UserCheck className="w-6 h-6 text-secondary" />
                            <h2 className="text-2xl font-bold text-secondary">حماية البيانات</h2>
                        </div>
                        <p className="text-gray-300 leading-relaxed">
                            نتخذ إجراءات أمنية فنية وتنظيمية لحماية بياناتك من الوصول غير المصرح به أو التغيير أو الإفشاء أو التدمير. تشمل هذه التدابير:
                        </p>
                        <ul className="list-disc list-inside space-y-2 text-gray-300 mr-4 mt-4">
                            <li>تشفير البيانات أثناء النقل والتخزين</li>
                            <li>الوصول المقيد للمعلومات الحساسة</li>
                            <li>تحديثات أمنية منتظمة</li>
                            <li>تدريب الموظفين على Practices الأمنية</li>
                        </ul>
                    </section>

                    {/* User Rights */}
                    <section className="border-t border-white/10 pt-8">
                        <h2 className="text-2xl font-bold mb-4 text-primary">حقوقك</h2>
                        <p className="text-gray-300 leading-relaxed mb-4">
                            لك الحق في:
                        </p>
                        <ul className="list-disc list-inside space-y-2 text-gray-300 mr-4">
                            <li>الوصول إلى بياناتك الشخصية</li>
                            <li>طلب تصحيح البيانات غير الدقيقة</li>
                            <li>طلب حذف بياناتك</li>
                            <li>الاعتراض على معالجة بياناتك</li>
                            <li>سحب موافقتك في أي وقت</li>
                        </ul>
                    </section>

                    {/* Contact */}
                    <section className="border-t border-white/10 pt-8">
                        <h2 className="text-2xl font-bold mb-4 text-secondary">تواصل معنا</h2>
                        <p className="text-gray-300 leading-relaxed">
                            لأي استفسارات أو طلبات متعلقة بسياسة الخصوصية، يرجى التواصل معنا عبر:
                        </p>
                        <div className="mt-4 p-4 bg-white/5 rounded-2xl space-y-2">
                            <p className="text-gray-300">البريد الإلكتروني: <span className="text-primary font-bold">info@albashayer.com</span></p>
                            <p className="text-gray-300">الهاتف: <span className="text-primary font-bold dir-ltr">0790320153</span></p>
                            <p className="text-gray-300">العنوان: الأردن - عمان - ماركا الجنوبية</p>
                        </div>
                    </section>
                </div>

                {/* Back Button */}
                <div className="text-center mt-12">
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 px-8 py-4 bg-primary hover:bg-primary-glow rounded-2xl font-bold transition-all shadow-lg shadow-primary/20"
                    >
                        العودة للصفحة الرئيسية
                    </Link>
                </div>
            </div>
        </div>
    );
}
