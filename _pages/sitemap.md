---
layout: archive
title: "Sitemap"
permalink: /sitemap/
author_profile: true
---

<h2>Pages</h2>
<ul>
  <li><a href="{{ '/' | relative_url }}">Home</a></li>
  {% for item in site.data.navigation.main %}
    <li><a href="{{ item.url | relative_url }}">{{ item.title }}</a></li>
  {% endfor %}
  <li><a href="{{ '/talkmap.html' | relative_url }}">Talk map</a></li>
</ul>

<h2>Teaching</h2>
<ul>
  {% for item in site.teaching reversed %}
    <li><a href="{{ item.url | relative_url }}">{{ item.title }}{% if item.term %} ({{ item.term }}){% elsif item.instructor %} ({{ item.instructor }}){% endif %}</a></li>
  {% endfor %}
</ul>

<h2>Talks</h2>
<ul>
  {% for item in site.talks reversed %}
    <li><a href="{{ item.url | relative_url }}">{{ item.title }}</a></li>
  {% endfor %}
</ul>
