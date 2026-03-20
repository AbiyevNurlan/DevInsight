import React from 'react'
import { Link } from 'react-router-dom'

type Props = React.ComponentProps<'a'> & { href?: string }

export function Button({ href, children, className = '', ...rest }: Props){
  const base = 'inline-flex items-center gap-2 px-4 py-2 rounded-full font-medium text-sm tracking-wide focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/80 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 transition-all'
  const style = `${base} btn-soft ${className}`
  if(href) return (<Link to={href} className={style} {...rest as any}>{children}</Link>)
  return (<button className={style} {...rest as any}>{children}</button>)
}
