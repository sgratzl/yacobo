export function CompareCircleFilled({ i }: { i?: number }) {
  return (
    <span role="img" aria-label="plus-circle" className="anticon">
      <svg
        viewBox="64 64 896 896"
        focusable="false"
        data-icon="plus-circle"
        width="1em"
        height="1em"
        style={{ fill: i == null ? 'currentColor' : `var(--compare-color${i + 1})` }}
        aria-hidden="true"
      >
        <path d="M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64z"></path>
      </svg>
    </span>
  );
}
