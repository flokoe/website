document.addEventListener('DOMContentLoaded', () => {
  {{ range.Store.Get "lightboxes" }}
    const {{ .}} = new SimpleLightbox('.{{ . }} a', { captionsData: 'alt' });
  {{ end }}
})
