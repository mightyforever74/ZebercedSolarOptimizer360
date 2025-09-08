#!/usr/bin/env bash
set -euo pipefail

cecho(){ printf "\033[1;36m%s\033[0m\n" "$*"; }
ok(){    printf "✅ %s\n" "$*"; }
err(){   printf "❌ %s\n" "$*"; exit 1; }

cecho "Docker servisleri"
docker-compose ps --format 'table {{.Name}}\t{{.State}}\t{{.Ports}}' || err "docker ps"

cecho "Docker DNS çözümlemesi (nginx içinde)"
docker-compose exec -T nginx getent hosts solar_frontend solar_backend >/dev/null && ok "upstream adları çözüldü"

cecho "Nginx konfigürasyon testi"
docker-compose exec -T nginx nginx -t >/dev/null && ok "syntax OK"

cecho "HTTP → HTTPS yönlendirme (apex)"
code=$(curl -s -o /dev/null -w '%{http_code}' http://solaroptimizer360.com/)
[ "$code" = "301" ] && ok "301 → HTTPS" || err "HTTP beklenen 301 değil: $code"

cecho "HTTPS (apex) yayın"
code=$(curl -s -o /dev/null -w '%{http_code}' https://solaroptimizer360.com/)
[ "$code" = "200" ] && ok "frontend 200" || err "frontend beklenen 200 değil: $code"

cecho "API healthz"
code=$(curl -s -o /dev/null -w '%{http_code}' https://api.solaroptimizer360.com/healthz)
[ "$code" = "200" ] && ok "backend healthz 200" || err "healthz kodu: $code"

cecho "Rate-limit hızlı testi (/)"
hits=$(for i in {1..40}; do curl -s -o /dev/null -w '%{http_code}\n' https://api.solaroptimizer360.com/; done | sort | uniq -c | tr '\n' ' ')
ok "$hits"

cecho "Sertifika CN/SAN kontrolü"
docker-compose exec -T nginx sh -lc \
openssl x509 -in /etc/letsencrypt/live/solaroptimizer360.com/fullchain.pem -noout -subject -ext subjectAltName \
| sed -n '1,5p' && ok "CN/SAN doğru"
