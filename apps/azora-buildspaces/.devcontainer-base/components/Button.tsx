import React from 'react'
import styles from './Button.module.css'

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement>

export default function Button(props: ButtonProps): JSX.Element {
  return <button type="button" className={styles.btn} {...props} />
}
