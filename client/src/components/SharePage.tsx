import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { FormPreview } from "./FormPreview";
import { Loader2, AlertCircle } from "lucide-react";
import { type ComponentSchema } from "../types/editor";

export const SharePage: React.FC = () => {
    const { formId } = useParams<{ formId: string }>();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [formData, setFormData] = useState<{ title: string; components: ComponentSchema[] } | null>(null);

    useEffect(() => {
        const fetchForm = async () => {
            try {
                const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/forms/${formId}`);
                const result = await res.json();
                if (result.success) {
                    setFormData(result.data);
                    // 修改网页标题
                    document.title = result.data.title || "问卷表单";
                } else {
                    setError(result.message);
                }
            } catch (e) {
                setError("网络请求失败，请稍后重试");
            } finally {
                setLoading(false);
            }
        };

        fetchForm();
    }, [formId]);

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-indigo-500">
                <Loader2 className="w-8 h-8 animate-spin mb-4" />
                <p className="text-sm font-medium">正在加载表单...</p>
            </div>
        );
    }

    if (error || !formData) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-slate-500">
                <AlertCircle className="w-12 h-12 text-red-400 mb-4" />
                <h2 className="text-lg font-bold text-slate-700">{error || "加载失败"}</h2>
            </div>
        );
    }

    return (
        // 使用上一轮我们优化好的移动端自适应 FormPreview
        <FormPreview
            overrideComponents={formData.components}
            isEmbedded={false} // 设为 false，让它展现完整的页面样式
        />
    );
};