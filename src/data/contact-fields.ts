export const contactFields = [
  { key: 'name', type: 'text', id: 'campo-nome', errorId: 'campo-nome-error', autocomplete: 'name', labelKey: 'form.name', phKey: 'form.name.ph' },
  { key: 'email', type: 'email', id: 'campo-email', errorId: 'campo-email-error', autocomplete: 'email', labelKey: 'form.email', phKey: 'form.email.ph' },
  { key: 'message', type: 'textarea', id: 'campo-mensagem', errorId: 'campo-mensagem-error', autocomplete: 'off', labelKey: 'form.message', phKey: 'form.message.ph' },
] as const;
