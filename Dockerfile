FROM mhart/alpine-node:11.6.0

RUN adduser -D -s /bin/bash -h /var/ws anon
COPY run.js /var/run/
WORKDIR /var/ws
USER anon

CMD ["node", \
  "--harmony-class-fields", \
  "--harmony-private-fields", \
  "--harmony-static-fields", \
  "--harmony-public-fields", \
  "--harmony-do-expressions", \
  "--experimental-vm-modules", \
  "--experimental-modules", \
  "--no-warnings", \
  "/var/run/run.js"]
