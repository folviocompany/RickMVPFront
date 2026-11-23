export const MAX_FILE_SIZE = 20 * 1024 * 1024

export function validatePdf(file) {
  if (!file) return 'Selecione um arquivo PDF.'
  if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
    return 'Formato inválido. Envie somente arquivos PDF.'
  }
  if (file.size > MAX_FILE_SIZE) return 'O arquivo excede o limite de 20 MB.'
  if (file.size === 0) return 'O arquivo selecionado está vazio.'
  return null
}
