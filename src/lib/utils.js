// src/lib/utils.js

/**
 * Basit bir `className` birleştirme fonksiyonu.
 * Falsy (false/null/undefined) değerleri atlayıp, geriye kalan sınıfları
 * tek bir string halinde döndürür.
 *
 * Örnek:
 *   cn("btn", isActive && "btn-primary", "rounded")
 *   // -> "btn btn-primary rounded" (isActive true ise)
 */
export function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}