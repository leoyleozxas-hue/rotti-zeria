// components/ui/data-table.jsx
//
// Tabla del panel: cabecera sticky, scroll horizontal contenido y fila vacía
// con mensaje. La usan Productos y Pedidos en su vista de lista, para que la
// misma información se lea igual en las dos pantallas.

export default function DataTable({ columns, children, minWidth = '680px' }) {
  return (
    <div className="w-full overflow-hidden rounded-card border border-white/10 bg-ink-900/60 shadow-panel">
      <div className="custom-scrollbar w-full overflow-x-auto">
        <table className="w-full text-sm" style={{ minWidth }}>
          <thead className="sticky top-0 z-10 bg-ink-950/95 backdrop-blur">
            <tr className="border-b border-white/10">
              {columns.map((column) => (
                <th
                  key={column.key}
                  scope="col"
                  className={`whitespace-nowrap px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40 ${
                    column.align === 'right' ? 'text-right' : 'text-left'
                  }`}
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>{children}</tbody>
        </table>
      </div>
    </div>
  )
}

/** Fila de tabla con hover consistente y entrada escalonada. */
export function Row({ children, index = 0, className = '' }) {
  return (
    <tr
      className={`anim-rise border-b border-white/6 transition-colors last:border-0 hover:bg-white/[0.035] ${className}`}
      style={{ '--i': index }}
    >
      {children}
    </tr>
  )
}

export function Cell({ children, align = 'left', className = '', ...rest }) {
  return (
    <td
      className={`px-4 py-3 ${align === 'right' ? 'text-right' : ''} ${className}`}
      {...rest}
    >
      {children}
    </td>
  )
}
