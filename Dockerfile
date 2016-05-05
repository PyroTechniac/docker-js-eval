FROM ubuntu
MAINTAINER f.bagnardi@gmail.com

RUN apt-get update && apt-get install -y curl jq

RUN adduser --disabled-password --shell /bin/bash --home /var/ws anon
RUN chown -R anon:anon /var/ws
WORKDIR /var/ws
ADD ./nvm ./nvm
RUN bash -c '. ./nvm/nvm.sh; \
  nvm install 4; \
  nvm install 5; \
  nvm install 6; \
  npm install babel-standalone babel-polyfill object-inspect'
COPY eval-the-code.bash ./
COPY eval-js.js ./
RUN chmod 555 eval-the-code.bash
USER anon

ENV BABEL_CACHE_PATH /var/ws/.babel.json
CMD ["bash", "eval-the-code.bash"]

