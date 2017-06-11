---
layout: page
title: All Posts
---

<div class="home">
  <ul class="project-section-list">
    <li>
      <ul class="projects-list">
        {% for post in site.posts %}
          <li>
            <a href="{{ post.url | relative_url }}">{{ post.title | escape }}</a>
            ({{ post.date | date: "%Y-%m-%d" }})
          </li>
        {% endfor %}
      </ul>
    </li>
  </ul>
</div>
