FROM europe-north1-docker.pkg.dev/cgr-nav/pull-through/nav.no/node:24-slim

WORKDIR /app

COPY .next/standalone /app/
COPY .next/static /app/.next/static
COPY public /app/public

EXPOSE 3000

ENV NODE_ENV=production
# Next.js standalone-serveren binder til process.env.HOSTNAME. I Kubernetes settes
# HOSTNAME til pod-navnet, så serveren forsøker å binde til et navn den ikke kan —
# og containeren crash-looper. Tving binding til alle interface.
ENV HOSTNAME=0.0.0.0
ENV PORT=3000

# Basisimaget (Chainguard/cgr-nav node) har ENTRYPOINT ["node"]. CMD må derfor
# IKKE gjenta "node" — ellers blir kommandoen `node node server.js` og containeren
# crasher med «Cannot find module '/app/node'».
CMD ["server.js"]
