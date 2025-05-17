// src/components/common/LinkCell.jsx
import React         from 'react'

export default function LinkCell({ id, text, onClick }) {

  return (
    <>
      <span
        className="p-1 btn-primary"
        style={{
          cursor:        'pointer',
          backgroundColor:'#3b71ca',
          color:          'white',
          borderRadius:  '6px'
        }}
        onClick={() => onClick(id)}
      >
        {text}
      </span>
    </>
  )
}
