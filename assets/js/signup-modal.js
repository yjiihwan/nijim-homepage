/* 니짐내짐 — "시작하기" CTA 클릭 시 회원가입 안내 모달 (사장님 랜딩 5페이지 공용)
   WHY: href 는 원본 그대로 두고 JS 로만 가로챈다 (progressive enhancement)
   WHY: 버튼은 모양을 재현하지 않고 페이지의 .btn/.btn-sky/.btn-ghost 를 그대로 쓴다 */
(function () {
  'use strict';

  var TARGET_SELECTOR = 'a[href*="authentication/signin/basic"]';
  // WHY: 헤더 '센터관리자메뉴' 는 기존 회원의 로그인 진입 경로라 안내 없이 바로 보낸다
  var SKIP_SELECTOR = '[data-signup-modal="skip"]';
  var TITLE = '간단한 회원가입 후 이용하실 수 있어요';
  var DESC = '가입비 없이 무료입니다. 회원가입을 마치면 바로 이용하실 수 있습니다.';

  var overlay = null;
  var dialog = null;
  var confirmBtn = null;
  var cancelBtn = null;
  var lastTrigger = null;
  var pending = null; // {href, target, rel}

  function build() {
    if (overlay) return;

    overlay = document.createElement('div');
    overlay.className = 'sgm-overlay';
    overlay.hidden = true;

    dialog = document.createElement('div');
    dialog.className = 'sgm-dialog';
    dialog.setAttribute('role', 'dialog');
    dialog.setAttribute('aria-modal', 'true');
    dialog.setAttribute('aria-labelledby', 'sgm-title');
    dialog.setAttribute('aria-describedby', 'sgm-desc');

    var icon = document.createElement('div');
    icon.className = 'sgm-icon';
    icon.setAttribute('aria-hidden', 'true');
    icon.innerHTML =
      '<svg viewBox="0 0 24 24" fill="none" stroke="var(--sky-strong, #1E93DD)" stroke-width="2.2" ' +
      'stroke-linecap="round" stroke-linejoin="round">' +
      '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>' +
      '<circle cx="9" cy="7" r="4"/><path d="M19 8v6M22 11h-6"/></svg>';

    var h = document.createElement('h2');
    h.className = 'sgm-title';
    h.id = 'sgm-title';
    h.textContent = TITLE;

    var p = document.createElement('p');
    p.className = 'sgm-desc';
    p.id = 'sgm-desc';
    p.textContent = DESC;

    var actions = document.createElement('div');
    actions.className = 'sgm-actions';

    confirmBtn = document.createElement('button');
    confirmBtn.type = 'button';
    confirmBtn.className = 'btn btn-sky sgm-confirm';
    confirmBtn.textContent = '확인';

    cancelBtn = document.createElement('button');
    cancelBtn.type = 'button';
    cancelBtn.className = 'btn btn-ghost sgm-cancel';
    cancelBtn.textContent = '취소';

    actions.appendChild(confirmBtn);
    actions.appendChild(cancelBtn);
    dialog.appendChild(icon);
    dialog.appendChild(h);
    dialog.appendChild(p);
    dialog.appendChild(actions);
    overlay.appendChild(dialog);
    document.body.appendChild(overlay);

    // WHY: 새 탭 열기는 사용자 제스처 안에서 동기 호출해야 팝업 차단을 피한다
    confirmBtn.addEventListener('click', function () {
      var go = pending;
      close();
      if (!go) return;
      if (go.target === '_blank') {
        var w = window.open(go.href, '_blank', 'noopener');
        if (w) { w.opener = null; }
      } else {
        window.location.href = go.href;
      }
    });

    cancelBtn.addEventListener('click', function () { close(); });

    // WHY: mousedown 기본동작이 핸들러 실행 뒤 포커스를 오버레이(→body)로 옮겨
    // 트리거 앵커로의 포커스 복귀를 덮어쓴다. preventDefault 로 막고 닫는다.
    overlay.addEventListener('mousedown', function (e) {
      if (e.target !== overlay) return;
      e.preventDefault();
      close();
    });

    document.addEventListener('keydown', function (e) {
      if (overlay.hidden) return;
      if (e.key === 'Escape' || e.key === 'Esc') {
        e.preventDefault();
        close();
        return;
      }
      if (e.key === 'Tab') trapFocus(e);
    });
  }

  function trapFocus(e) {
    var items = [confirmBtn, cancelBtn];
    var idx = items.indexOf(document.activeElement);
    e.preventDefault();
    var next;
    if (idx === -1) {
      next = items[0];
    } else if (e.shiftKey) {
      next = items[(idx - 1 + items.length) % items.length];
    } else {
      next = items[(idx + 1) % items.length];
    }
    next.focus();
  }

  function open(anchor) {
    build();
    lastTrigger = anchor;
    pending = {
      href: anchor.href,
      target: anchor.getAttribute('target') || '',
      rel: anchor.getAttribute('rel') || ''
    };
    overlay.hidden = false;
    document.body.classList.add('sgm-locked');
    // WHY: hidden 해제 직후 프레임에서 클래스를 붙여야 트랜지션이 걸린다
    requestAnimationFrame(function () { overlay.classList.add('sgm-show'); });
    confirmBtn.focus();
  }

  function close() {
    if (!overlay || overlay.hidden) return;
    overlay.classList.remove('sgm-show');
    overlay.hidden = true;
    document.body.classList.remove('sgm-locked');
    pending = null;
    if (lastTrigger && document.contains(lastTrigger)) {
      try { lastTrigger.focus(); } catch (err) { /* noop */ }
    }
    lastTrigger = null;
  }

  function onClick(e) {
    var a = e.target.closest ? e.target.closest(TARGET_SELECTOR) : null;
    if (!a) return;
    if (a.matches(SKIP_SELECTOR)) return;
    if (e.defaultPrevented) return;
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
    e.preventDefault();
    open(a);
  }

  function init() {
    document.addEventListener('click', onClick);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
