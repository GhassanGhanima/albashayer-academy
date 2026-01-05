'use client';

import { FileText, Users, AlertTriangle, Scale } from 'lucide-react';
import Link from 'next/link';

export default function TermsConditions() {
    return (
        <div className="min-h-screen bg-dark text-white py-20">
            <div className="container mx-auto px-4 max-w-4xl">
                {/* Header */}
                <div className="text-center mb-16 animate-reveal">
                    <div className="w-20 h-20 bg-gradient-to-br from-secondary to-secondary-glow rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-secondary/20">
                        <FileText className="w-10 h-10 text-white" />
                    </div>
                    <h1 className="text-4xl font-black mb-4">الشروط والأحكام</h1>
                    <p className="text-gray-400 text-lg">آخر تحديث: يناير 2026</p>
                </div>

                {/* Content */}
                <div className="glass-card p-8 md:p-12 rounded-[40px] space-y-8 animate-reveal">
                    {/* Introduction */}
                    <section>
                        <h2 className="text-2xl font-bold mb-4 text-secondary">قبول الشروط</h2>
                        <p className="text-gray-300 leading-relaxed">
                            باستخدامك لموقع أكاديمية البشائر لكرة القدم وخدماتها، أنت توافق على الالتزام بهذه الشروط والأحكام. إذا كنت لا توافق على هذه الشروط، يرجى عدم استخدام موقعنا أو خدماتنا.
                        </p>
                    </section>

                    {/* Registration */}
                    <section className="border-t border-white/10 pt-8">
                        <div className="flex items-center gap-3 mb-4">
                            <Users className="w-6 h-6 text-primary" />
                            <h2 className="text-2xl font-bold text-primary">التسجيل والاشتراك</h2>
                        </div>
                        <div className="space-y-4 text-gray-300">
                            <div>
                                <h3 className="font-bold text-white mb-2">الشروط العامة:</h3>
                                <ul className="list-disc list-inside space-y-2 mr-4">
                                    <li>يجب تقديم معلومات دقيقة وحقيقية كاملة عند التسجيل</li>
                                    <li>العمر الأدنى للتسجيل هو 6 سنوات</li>
                                    <li>يجب على ولي الأمر التوقيع على نموذج التسجيل للمشاركين تحت سن 18</li>
                                    <li>يجب تجديد الاشتراك سنوياً للحفاظ على العضوية النشطة</li>
                                </ul>
                            </div>
                            <div>
                                <h3 className="font-bold text-white mb-2">الرسوم والدفع:</h3>
                                <ul className="list-disc list-inside space-y-2 mr-4">
                                    <li>تحدد رسوم الاشتراك حسب البرنامج التدريبي المختار</li>
                                    <li>يجب سداد الرسوم عند بدء الاشتراك</li>
                                    <li>لا توجد استردادات بعد بدء البرنامج التدريبي</li>
                                    <li>يجوز تعديل الرسوم مع إشعار مسبق</li>
                                </ul>
                            </div>
                        </div>
                    </section>

                    {/* Code of Conduct */}
                    <section className="border-t border-white/10 pt-8">
                        <div className="flex items-center gap-3 mb-4">
                            <AlertTriangle className="w-6 h-6 text-secondary" />
                            <h2 className="text-2xl font-bold text-secondary">قواعد السلوك</h2>
                        </div>
                        <p className="text-gray-300 leading-relaxed mb-4">
                            نتوقع من جميع اللاعبين وأولياء الأمور والزوار الالتزام بـ:
                        </p>
                        <ul className="list-disc list-inside space-y-2 text-gray-300 mr-4">
                            <li>احترام المدربين والموظفين واللاعبين الآخرين</li>
                            <li>الالتزام بالجدول الزمني للتمارين</li>
                            <li>ارتداء الزي الرياضي المخصص للأكاديمية</li>
                            <li>عدم استخدام العنف أو اللفظ البذيء</li>
                            <li>الحفاظ على نظافة المرافق والمعدات</li>
                            <li>عدم التدخل في أنشطة اللاعبين الآخرين</li>
                        </ul>
                    </section>

                    {/* Liability */}
                    <section className="border-t border-white/10 pt-8">
                        <div className="flex items-center gap-3 mb-4">
                            <Scale className="w-6 h-6 text-primary" />
                            <h2 className="text-2xl font-bold text-primary">المسؤولية والتحرير</h2>
                        </div>
                        <p className="text-gray-300 leading-relaxed mb-4">
                            المشاركة في الأنشطة الرياضية تنطوي على مخاطر محتومة. يوافق ولي الأمر / المشارك على ما يلي:
                        </p>
                        <ul className="list-disc list-inside space-y-2 text-gray-300 mr-4">
                            <li>تحرر أكاديمية البشائر من أي مسؤولية عن الإصابات أو الحوادث</li>
                            <li>الالتزام بتعليمات المدربين والموظفين</li>
                            <li>إعلام الأكاديمية بأي حالة طبية أو إصابة سابقة</li>
                            <li>الموافقة على تقديم الإسعافات الأولية عند الحاجة</li>
                        </ul>
                    </section>

                    {/* Media Usage */}
                    <section className="border-t border-white/10 pt-8">
                        <h2 className="text-2xl font-bold mb-4 text-secondary">استخدام الصور والوسائط</h2>
                        <p className="text-gray-300 leading-relaxed mb-4">
                            بالتسجيل في الأكاديمية، أنت تمنحنا الحق في:
                        </p>
                        <ul className="list-disc list-inside space-y-2 text-gray-300 mr-4">
                            <li>تصوير اللاعب أثناء التدريبات والمباريات</li>
                            <li>استخدام الصور والفيديوهات في المواد التسويقية</li>
                            <li>نشر صور اللاعبين على موقع الأكاديمية ووسائل التواصل الاجتماعي</li>
                            <li>استخدام أسماء اللاعبين في تقارير الأخبار والإنجازات</li>
                        </ul>
                    </section>

                    {/* Termination */}
                    <section className="border-t border-white/10 pt-8">
                        <h2 className="text-2xl font-bold mb-4 text-primary">إنهاء الاشتراك</h2>
                        <p className="text-gray-300 leading-relaxed mb-4">
                            تحتفظ الأكاديمية بالحق في إنهاء اشتراك أي لاعب في الحالات التالية:
                        </p>
                        <ul className="list-disc list-inside space-y-2 text-gray-300 mr-4">
                            <li>انتهاك قواعد السلوك والأخلاقيات</li>
                            <li>عدم سداد الرسوم المستحقة</li>
                            <li>السلوك العديف أو المسيء من قبل اللاعب أو ولي الأمر</li>
                            <li>تقديم معلومات كاذبة أو مضللة</li>
                        </ul>
                    </section>

                    {/* Changes */}
                    <section className="border-t border-white/10 pt-8">
                        <h2 className="text-2xl font-bold mb-4 text-secondary">تعديل الشروط</h2>
                        <p className="text-gray-300 leading-relaxed">
                            تحتفظ أكاديمية البشائر بالحق في تعديل هذه الشروط والأحكام في أي وقت. سيتم نشر أي تغييرات على هذه الصفحة. استخدامك المستمر للموقع بعد التعديلات يعني قبولك للشروط المحدثة.
                        </p>
                    </section>

                    {/* Contact */}
                    <section className="border-t border-white/10 pt-8">
                        <h2 className="text-2xl font-bold mb-4 text-primary">تواصل معنا</h2>
                        <p className="text-gray-300 leading-relaxed">
                            لأي استفسارات حول هذه الشروط والأحكام، يرجى التواصل معنا عبر:
                        </p>
                        <div className="mt-4 p-4 bg-white/5 rounded-2xl space-y-2">
                            <p className="text-gray-300">البريد الإلكتروني: <span className="text-secondary font-bold">info@albashayer.com</span></p>
                            <p className="text-gray-300">الهاتف: <span className="text-secondary font-bold dir-ltr">0790320153</span></p>
                            <p className="text-gray-300">العنوان: الأردن - عمان - ماركا الجنوبية</p>
                        </div>
                    </section>
                </div>

                {/* Back Button */}
                <div className="text-center mt-12">
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 px-8 py-4 bg-secondary hover:bg-secondary-glow rounded-2xl font-bold transition-all shadow-lg shadow-secondary/20"
                    >
                        العودة للصفحة الرئيسية
                    </Link>
                </div>
            </div>
        </div>
    );
}
