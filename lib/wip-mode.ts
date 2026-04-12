const ENABLED_VALUES = new Set(['1', 'true', 'yes', 'on'])

export function isWipModeEnabled() {
  const flag = process.env.NEXT_PUBLIC_PORTFOLIO_WIP_MODE
    ?.trim()
    .toLowerCase()

  return flag ? ENABLED_VALUES.has(flag) : false
}
