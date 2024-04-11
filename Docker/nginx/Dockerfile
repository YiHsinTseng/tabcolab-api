FROM nginx

RUN rm /etc/nginx/conf.d/default.conf

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY start-nginx.sh /start-nginx.sh

RUN chmod +x /start-nginx.sh

EXPOSE 80

CMD ["/start-nginx.sh"]