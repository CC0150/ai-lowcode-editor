export const Logo = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 40 40"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    {/* 虚线外框：象征低代码拖拽区域 */}
    <rect
      x="6"
      y="6"
      width="28"
      height="28"
      rx="6"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeDasharray="4 2"
      className="text-indigo-600"
    />

    {/* 实心组件：生成的表单项 */}
    <rect
      x="12"
      y="16"
      width="16"
      height="12"
      rx="3"
      fill="currentColor"
      className="text-indigo-600"
    />

    {/* AI 灵感点 */}
    <circle
      cx="28"
      cy="12"
      r="5"
      fill="currentColor"
      className="text-indigo-400"
    />
    <path
      d="M28 9V15M25 12H31"
      stroke="white"
      strokeWidth="1.5"
      strokeLinecap="round"
    />

    <path
      d="M12 12H20"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      className="text-indigo-600"
    />
  </svg>
);
