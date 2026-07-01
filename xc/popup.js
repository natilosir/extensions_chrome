document.addEventListener( 'DOMContentLoaded', function() {
	// ---- تنظیمات ----
	const SITE_URL = 'https://xcodestudio.ir';

	// ---- المان‌های DOM ----
	const usernameInput = document.getElementById( 'usernameInput' );
	const passwordInput = document.getElementById( 'passwordInput' );
	const loginBtn      = document.getElementById( 'loginBtn' );
	const logoutBtn     = document.getElementById( 'logoutBtn' );
	const userDisplay   = document.getElementById( 'userDisplay' );
	const loginStatus   = document.getElementById( 'loginStatus' );
	const loginCard     = document.getElementById( 'loginCard' );
	const mainSection   = document.getElementById( 'mainSection' );
	const statusDiv     = document.getElementById( 'status' );

	// Timer States
	const stateIdle           = document.getElementById( 'stateIdle' );
	const stateRunning        = document.getElementById( 'stateRunning' );
	const stateFinalize       = document.getElementById( 'stateFinalize' );
	const startBtn            = document.getElementById( 'startBtn' );
	const stopBtn             = document.getElementById( 'stopBtn' );
	const cancelBtn           = document.getElementById( 'cancelBtn' );
	const runningTimerDisplay = document.getElementById( 'runningTimer' );
	const idleTimerDisplay    = stateIdle.querySelector( '.timer-display' );

	// Finalize Elements
	const finalStart       = document.getElementById( 'finalStart' );
	const finalEnd         = document.getElementById( 'finalEnd' );
	const finalDuration    = document.getElementById( 'finalDuration' );
	const newProjectSelect = document.getElementById( 'newProjectSelect' );
	const newTaskSelect    = document.getElementById( 'newTaskSelect' );
	const addTaskBtn       = document.getElementById( 'addTaskBtn' );
	const submitLogBtn     = document.getElementById( 'submitLogBtn' );

	// Logs Elements
	const recentLogListContainer = document.getElementById( 'recentLogListContainer' );
	const refreshLogsBtn         = document.getElementById( 'refreshLogsBtn' );

	// ---- متغیرهای سراسری ----
	let token        = '';
	let userData     = null;
	let allTasks     = [];
	let currentLogs  = [];
	let editingLogId = null;

	let timerInterval       = null;
	let timerStartTimestamp = null;
	let timerEndTimestamp   = null;

	// ---- توابع کمکی ----
	function setStatus(msg, type = 'info') {
		statusDiv.textContent = msg;
		statusDiv.className   = `status-message ${type}`;
		if ( !msg ) statusDiv.style.display = 'none';
	}

	function setLoginStatus(msg, isError = false) {
		loginStatus.textContent = msg;
		loginStatus.style.color = isError ? '#DC2626' : '#16A34A';
	}

	// ============================================================
	//  تبدیل تاریخ‌ها با الگوریتم دقیق (Jalali ↔ Gregorian)
	//  برگرفته از کتابخانه‌ی معروف jalaali-js
	// ============================================================

	function toJalali(gy, gm, gd) {
		var g_d_m = [ 0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334 ];
		var j_d_m = [ 0, 31, 31, 31, 31, 31, 31, 30, 30, 30, 30, 30, 29 ];
		var gy2   = ( gm > 2 ) ? gy + 1 : gy;
		var days  = 355666 + ( 365 * gy ) + Math.floor( ( gy2 + 3 ) / 4 ) - Math.floor( ( gy2 + 99 ) / 100 ) + Math.floor( ( gy2 + 399 ) / 400 ) + gd + g_d_m[gm - 1];
		if ( gm > 2 && ( ( gy % 4 === 0 && gy % 100 !== 0 ) || ( gy % 400 === 0 ) ) ) days ++;
		var jy = - 1595 + ( 33 * Math.floor( days / 12053 ) );
		days %= 12053;
		jy += 4 * Math.floor( days / 1461 );
		days %= 1461;
		if ( days > 365 ) {
			jy += Math.floor( ( days - 1 ) / 365 );
			days = ( days - 1 ) % 365;
		}
		var jm = 1;
		for ( var i = 1; i <= 12; i ++ ) {
			if ( days <= j_d_m[i] ) {
				jm = i;
				break;
			}
			days -= j_d_m[i];
		}
		return {
			year: jy,
			month: jm,
			day: days
		};
	}

	function toGregorian(jy, jm, jd) {
		var j_d_m = [ 0, 31, 31, 31, 31, 31, 31, 30, 30, 30, 30, 30, 29 ];
		var g_d_m = [ 0, 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31 ];

		var days = 0;
		for ( var i = 1; i < jm; i ++ ) {
			days += j_d_m[i];
		}
		days += jd;

		var base      = 226899;
		var totalDays = base + days;

		var year = 1;
		while ( totalDays > 365 ) {
			var isLeap = ( year % 4 === 0 && ( year % 100 !== 0 || year % 400 === 0 ) );
			if ( totalDays > ( isLeap ? 366 : 365 ) ) {
				totalDays -= isLeap ? 366 : 365;
				year ++;
			} else {
				break;
			}
		}

		var month = 1;
		var gDays = g_d_m.slice();
		if ( year % 4 === 0 && ( year % 100 !== 0 || year % 400 === 0 ) ) {
			gDays[2] = 29;
		}
		while ( totalDays > gDays[month] ) {
			totalDays -= gDays[month];
			month ++;
		}

		return {
			year: year,
			month: month,
			day: totalDays
		};
	}

	// ============================================================

	// ---- فرمت کردن تاریخ جلالی با اعداد انگلیسی (برای jalalidatepicker) ----
	function formatJalaliDatetime(date) {
		const formatter = new Intl.DateTimeFormat( 'en-US', {
			year: 'numeric',
			month: '2-digit',
			day: '2-digit',
			hour: '2-digit',
			minute: '2-digit',
			hour12: false,
			calendar: 'persian'
		} );
		const parts     = formatter.formatToParts( date );
		const values    = {};
		parts.forEach( p => {
			if ( p.type !== 'literal' ) values[p.type] = p.value;
		} );
		return `${values.year}/${values.month}/${values.day} ${values.hour}:${values.minute}`;
	}

	// ---- محاسبه مدت زمان از دو رشته جلالی ----
	function calculateDurationFromJalali(startStr, endStr) {
		if ( !startStr ) return '—';
		if ( !endStr ) return 'در حال انجام';

		const parseJalali = (str) => {
			const match = str.match( /^(\d{4})\/(\d{1,2})\/(\d{1,2})\s+(\d{1,2}):(\d{1,2})$/ );
			if ( !match ) return null;
			return {
				year: parseInt( match[1] ),
				month: parseInt( match[2] ),
				day: parseInt( match[3] ),
				hour: parseInt( match[4] ),
				minute: parseInt( match[5] )
			};
		};

		const start = parseJalali( startStr );
		const end   = parseJalali( endStr );
		if ( !start || !end ) return '—';

		const startG = toGregorian( start.year, start.month, start.day );
		const endG   = toGregorian( end.year, end.month, end.day );

		const startDate = new Date( startG.year, startG.month - 1, startG.day, start.hour, start.minute );
		const endDate   = new Date( endG.year, endG.month - 1, endG.day, end.hour, end.minute );

		const diffMs = endDate - startDate;
		if ( diffMs < 0 ) return 'منفی!';

		const totalMinutes = Math.floor( diffMs / 60000 );
		const h            = Math.floor( totalMinutes / 60 );
		const m            = totalMinutes % 60;
		if ( h > 0 ) return `${h} ساعت و ${m} دقیقه`;
		if ( m > 0 ) return `${m} دقیقه`;
		return 'کمتر از ۱ دقیقه';
	}

	// ---- فرمت کردن دقیقه‌ها ----
	function formatDuration(minutes) {
		if ( !minutes ) return 'کمتر از ۱ دقیقه';
		const h = Math.floor( minutes / 60 );
		const m = minutes % 60;
		if ( h > 0 ) return h + 'h ' + m + 'm';
		return m + 'm';
	}

	function formatDurationFromTimestamps(start, end) {
		const diffMs       = end - start;
		const totalMinutes = Math.floor( diffMs / 60000 );
		const h            = Math.floor( totalMinutes / 60 );
		const m            = totalMinutes % 60;
		if ( h > 0 ) return `${h} ساعت و ${m} دقیقه`;
		if ( m > 0 ) return `${m} دقیقه`;
		return 'کمتر از ۱ دقیقه';
	}

	// ---- مدیریت وضعیت‌های تایمر ----
	function initTimerState() {
		chrome.storage.local.get( [ 'timer_start', 'timer_end' ], function(result) {
			if ( result.timer_start ) {
				timerStartTimestamp = result.timer_start;
				if ( result.timer_end ) {
					timerEndTimestamp = result.timer_end;
					showFinalizeState();
				} else {
					showRunningState();
				}
			} else {
				showIdleState();
			}
		} );
	}

	function showIdleState() {
		stateIdle.style.display      = 'flex';
		stateRunning.style.display   = 'none';
		stateFinalize.style.display  = 'none';
		idleTimerDisplay.textContent = '00:00:00';
		clearInterval( timerInterval );
	}

	function showRunningState() {
		stateIdle.style.display     = 'none';
		stateRunning.style.display  = 'flex';
		stateFinalize.style.display = 'none';
		startTimerInterval();
	}

	function showFinalizeState() {
		stateIdle.style.display     = 'none';
		stateRunning.style.display  = 'none';
		stateFinalize.style.display = 'block';
		clearInterval( timerInterval );

		const startDate = new Date( timerStartTimestamp );
		const endDate   = new Date( timerEndTimestamp );

		finalStart.value          = formatJalaliDatetime( startDate );
		finalEnd.value            = formatJalaliDatetime( endDate );
		finalDuration.textContent = formatDurationFromTimestamps( timerStartTimestamp, timerEndTimestamp );

		if ( newProjectSelect.options.length <= 1 ) loadProjects();
	}

	function startTimerInterval() {
		clearInterval( timerInterval );
		const updateDisplay = () => {
			const now                       = Date.now();
			const diff                      = now - timerStartTimestamp;
			runningTimerDisplay.textContent = formatMilliseconds( diff );
		};
		updateDisplay();
		timerInterval = setInterval( updateDisplay, 1000 );
	}

	function formatMilliseconds(ms) {
		const totalSeconds = Math.floor( ms / 1000 );
		const h            = Math.floor( totalSeconds / 3600 );
		const m            = Math.floor( ( totalSeconds % 3600 ) / 60 );
		const s            = totalSeconds % 60;
		return `${String( h ).padStart( 2, '0' )}:${String( m ).padStart( 2, '0' )}:${String( s ).padStart( 2, '0' )}`;
	}

	function startTimer() {
		timerStartTimestamp = Date.now();
		chrome.storage.local.set( { timer_start: timerStartTimestamp }, function() {
			showRunningState();
			setStatus( 'تایمر شروع شد.', 'success' );
		} );
	}

	function stopTimer() {
		timerEndTimestamp = Date.now();
		chrome.storage.local.set( { timer_end: timerEndTimestamp }, function() {
			showFinalizeState();
			setStatus( 'تایمر متوقف شد. زمان‌ها را بررسی و پروژه را انتخاب کنید.', 'info' );
		} );
	}

	function cancelTimer() {
		chrome.storage.local.remove( [ 'timer_start', 'timer_end' ], function() {
			timerStartTimestamp = null;
			timerEndTimestamp   = null;
			showIdleState();
			setStatus( 'تایمر لغو شد.', 'info' );
		} );
	}

	// ---- محاسبه خودکار مدت زمان هنگام تغییر تاریخ ----
	function recalculateFinalizeDuration() {
		const start               = finalStart.value.trim();
		const end                 = finalEnd.value.trim();
		finalDuration.textContent = calculateDurationFromJalali( start, end );
	}

	function recalculateEditDuration(logItem) {
		if ( !logItem ) return;
		const startInput   = logItem.querySelector( '.edit-start' );
		const endInput     = logItem.querySelector( '.edit-end' );
		const durationSpan = logItem.querySelector( '.edit-duration' );
		if ( startInput && endInput && durationSpan ) {
			durationSpan.textContent = calculateDurationFromJalali( startInput.value.trim(), endInput.value.trim() );
		}
	}

	// ---- احراز هویت ----
	function restoreToken() {
		chrome.storage.local.get( [ 'jwt_token', 'jwt_user' ], function(result) {
			if ( result.jwt_token && result.jwt_user ) {
				token    = result.jwt_token;
				userData = result.jwt_user;
				showLoggedInState();
				initTimerState();
				loadRecentLogs();
				setLoginStatus( 'خوش آمدید ' + userData.display_name, false );
			} else {
				showLoggedOutState();
				setLoginStatus( 'لطفاً وارد شوید.', false );
			}
		} );
	}

	function showLoggedInState() {
		loginBtn.style.display      = 'none';
		logoutBtn.style.display     = 'inline-block';
		usernameInput.style.display = 'none';
		passwordInput.style.display = 'none';
		userDisplay.textContent     = userData ? userData.display_name : 'کاربر';
		mainSection.style.display   = 'block';
		loginCard.style.display     = 'none';
	}

	function showLoggedOutState() {
		loginBtn.style.display      = 'inline-block';
		logoutBtn.style.display     = 'none';
		usernameInput.style.display = 'inline-block';
		passwordInput.style.display = 'inline-block';
		userDisplay.textContent     = '';
		mainSection.style.display   = 'none';
		loginCard.style.display     = 'block';
		cancelTimer();
	}

	function login(username, password) {
		const loginUrl = SITE_URL + '/wp-json/jwt-auth/v1/token';
		setLoginStatus( 'در حال ورود...', false );
		loginBtn.disabled = true;

		fetch( loginUrl, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify( {
				username,
				password
			} )
		} )
			.then( res => res.json() )
			.then( data => {
				loginBtn.disabled = false;
				if ( data.token ) {
					token    = data.token;
					userData = {
						display_name: data.user_display_name,
						email: data.user_email,
						nicename: data.user_nicename
					};
					chrome.storage.local.set( {
						jwt_token: token,
						jwt_user: userData
					}, function() {
						setLoginStatus( 'ورود موفق ✅', false );
						showLoggedInState();
						initTimerState();
						loadRecentLogs();
					} );
				} else {
					setLoginStatus( data.message.replace( /<[^>]*>/g, '' ) || 'نام کاربری یا رمز عبور اشتباه است.', true );
				}
			} )
			.catch( err => {
				loginBtn.disabled = false;
				setLoginStatus( 'خطا در ارتباط با سرور.', true );
			} );
	}

	function logout() {
		chrome.storage.local.remove( [ 'jwt_token', 'jwt_user', 'timer_start', 'timer_end' ], function() {
			token    = '';
			userData = null;
			showLoggedOutState();
			setLoginStatus( 'خارج شدید.', false );
		} );
	}

	// ---- پروژه‌ها و تسک‌ها ----
	function loadProjects() {
		const ajaxUrl  = SITE_URL + '/wp-admin/admin-ajax.php';
		const formData = new FormData();
		formData.append( 'action', 'xc_pm_time_logs_get_projects' );

		fetchWithAuth( ajaxUrl, {
			method: 'POST',
			body: formData
		} )
			.then( res => res.json() )
			.then( data => {
				if ( data.success ) {
					const projects = data.data.projects || [];
					let html       = '<option value="">-- انتخاب پروژه --</option>';
					projects.forEach( proj => {
						html += `<option value="${proj.id}">${proj.title}</option>`;
					} );
					newProjectSelect.innerHTML = html;
				} else {
					setStatus( 'خطا در دریافت پروژه‌ها: ' + ( data.data.message || 'خطای ناشناخته' ), 'error' );
				}
			} )
			.catch( err => {
				setStatus( 'خطا در ارتباط با سرور برای دریافت پروژه‌ها.', 'error' );
			} );
	}

	function loadTasks(projectId, targetSelect = newTaskSelect) {
		if ( !projectId ) {
			targetSelect.innerHTML = '<option value="">-- انتخاب تسک --</option>';
			if ( targetSelect === newTaskSelect ) allTasks = [];
			return;
		}
		const ajaxUrl  = SITE_URL + '/wp-admin/admin-ajax.php';
		const formData = new FormData();
		formData.append( 'action', 'xc_pm_time_logs_get_tasks_by_project' );
		formData.append( 'project_id', projectId );

		fetchWithAuth( ajaxUrl, {
			method: 'POST',
			body: formData
		} )
			.then( res => res.json() )
			.then( data => {
				if ( data.success ) {
					const tasks = data.data.tasks || [];
					if ( targetSelect === newTaskSelect ) allTasks = tasks;
					populateTaskSelect( tasks, targetSelect );
				}
			} );
	}

	function populateTaskSelect(tasks, targetSelect) {
		targetSelect.innerHTML = '<option value="">-- انتخاب تسک --</option>';
		tasks.forEach( task => {
			const opt       = document.createElement( 'option' );
			opt.value       = task.id;
			opt.textContent = task.title;
			targetSelect.appendChild( opt );
		} );
	}

	function addNewTask(projectId, taskName) {
		if ( !projectId || !taskName.trim() ) return;

		const ajaxUrl  = SITE_URL + '/wp-admin/admin-ajax.php';
		const formData = new FormData();
		formData.append( 'action', 'xc_pm_time_logs_add_task' );
		formData.append( 'project_id', projectId );
		formData.append( 'task_title', taskName.trim() );

		setStatus( 'در حال ایجاد تسک...', 'info' );
		addTaskBtn.disabled = true;

		fetchWithAuth( ajaxUrl, {
			method: 'POST',
			body: formData
		} )
			.then( res => res.json() )
			.then( data => {
				addTaskBtn.disabled = false;
				if ( data.success ) {
					setStatus( '✅ تسک جدید ایجاد شد.', 'success' );
					// به‌روزرسانی لیست تسک‌ها با داده‌های برگشتی
					if ( data.data.tasks ) {
						populateTaskSelect( data.data.tasks, newTaskSelect );
					} else {
						// در صورت عدم دریافت لیست، دوباره بارگذاری کن
						loadTasks( projectId, newTaskSelect );
					}
				} else {
					setStatus( '❌ خطا: ' + ( data.data.message || 'خطای ناشناخته' ), 'error' );
				}
			} )
			.catch( err => {
				addTaskBtn.disabled = false;
				setStatus( '❌ خطا در ارتباط با سرور.', 'error' );
			} );
	}

	// ---- ثبت و نمایش لاگ‌ها ----
	function fetchWithAuth(url, options = {}) {
		const headers = options.headers || {};
		if ( token ) headers['Authorization'] = 'Bearer ' + token;
		return fetch( url, {
			... options,
			headers: headers
		} );
	}

	function submitLog() {
		const projectId = newProjectSelect.value;
		const taskId    = newTaskSelect.value;
		const start     = finalStart.value.trim();
		const end       = finalEnd.value.trim();

		if ( !projectId || !taskId ) {
			setStatus( 'لطفاً پروژه و تسک را انتخاب کنید.', 'error' );
			return;
		}
		if ( !start ) {
			setStatus( 'لطفاً زمان شروع را وارد کنید.', 'error' );
			return;
		}

		const ajaxUrl  = SITE_URL + '/wp-admin/admin-ajax.php';
		const formData = new FormData();
		formData.append( 'action', 'xc_pm_time_logs_admin_add' );
		formData.append( 'project_id', projectId );
		formData.append( 'task_id', taskId );
		formData.append( 'start', start );
		formData.append( 'end', end || '' );

		setStatus( 'در حال ثبت...', 'info' );
		submitLogBtn.disabled = true;

		fetchWithAuth( ajaxUrl, {
			method: 'POST',
			body: formData
		} )
			.then( res => res.json() )
			.then( data => {
				submitLogBtn.disabled = false;
				if ( data.success ) {
					setStatus( '✅ لاگ با موفقیت ثبت شد.', 'success' );
					cancelTimer();
					loadRecentLogs();
				} else {
					setStatus( '❌ خطا: ' + ( data.data.message || 'خطای ناشناخته' ), 'error' );
				}
			} )
			.catch( () => {
				submitLogBtn.disabled = false;
				setStatus( '❌ خطا در ارتباط با سرور.', 'error' );
			} );
	}

	function loadRecentLogs() {
		recentLogListContainer.innerHTML = '<div class="no-logs">در حال بارگذاری...</div>';
		const ajaxUrl                    = SITE_URL + '/wp-admin/admin-ajax.php';
		const formData                   = new FormData();
		formData.append( 'action', 'xc_pm_time_logs_recent' );

		fetchWithAuth( ajaxUrl, {
			method: 'POST',
			body: formData
		} )
			.then( res => res.json() )
			.then( data => {
				if ( data.success ) {
					currentLogs = data.data.rows || [];
					renderRecentLogs( currentLogs );
				} else {
					recentLogListContainer.innerHTML = '<div class="no-logs">خطا در بارگذاری.</div>';
				}
			} )
			.catch( () => {
				recentLogListContainer.innerHTML = '<div class="no-logs">خطا در ارتباط با سرور.</div>';
			} );
	}

	function renderRecentLogs(logs) {
		if ( !logs || logs.length === 0 ) {
			recentLogListContainer.innerHTML = '<div class="no-logs">هیچ تایم‌لاگی یافت نشد.</div>';
			return;
		}
		let html = '';
		logs.forEach( log => {
			const isEditing   = ( editingLogId === log.id );
			const timeDisplay = log.end_local ? `${log.start_local} تا ${log.end_local}` : log.start_local;

			if ( isEditing ) {
				html += `
                    <div class="log-item editing" data-log-id="${log.id}">
                        <div class="edit-fields">
                            <div>
                                <label>شروع:</label>
                                <input type="text" class="edit-start date-input" data-jdp value="${log.start_local || ''}">
                            </div>
                            <div>
                                <label>پایان:</label>
                                <input type="text" class="edit-end date-input" data-jdp value="${log.end_local || ''}">
                            </div>
                        </div>
                        <div class="log-actions">
                        <div>
                            <label>مدت زمان:</label>
                            <span class="edit-duration">${calculateDurationFromJalali( log.start_local, log.end_local )}</span>
                        </div>
                            <button class="btn btn-success btn-small save-btn" data-id="${log.id}">💾 ذخیره</button>
                            <button class="btn btn-secondary btn-small cancel-btn" data-id="${log.id}">✕ انصراف</button>
                        </div>
                    </div>
                `;
			} else {
				html += `
                    <div class="log-item" data-log-id="${log.id}">
                        <div class="log-details">
                            <span class="log-task">${log.task_title || ''}</span>
                            <span class="log-time">${timeDisplay}</span>
                        </div>
                        <div class="log-actions">
                            <span class="log-duration">${formatDuration( log.minutes )}</span>
                            <button class="btn btn-text btn-small edit-btn" data-id="${log.id}">✏️ ویرایش</button>
                        </div>
                    </div>
                `;
			}
		} );
		recentLogListContainer.innerHTML = html;

		document.querySelectorAll( '.edit-btn' ).forEach( btn => {
			btn.addEventListener( 'click', function() {
				editingLogId = parseInt( this.dataset.id );
				renderRecentLogs( currentLogs );
			} );
		} );

		document.querySelectorAll( '.cancel-btn' ).forEach( btn => {
			btn.addEventListener( 'click', function() {
				editingLogId = null;
				renderRecentLogs( currentLogs );
			} );
		} );

		document.querySelectorAll( '.save-btn' ).forEach( btn => {
			btn.addEventListener( 'click', function() {
				const id    = parseInt( this.dataset.id );
				const item  = this.closest( '.log-item' );
				const start = item.querySelector( '.edit-start' ).value.trim();
				const end   = item.querySelector( '.edit-end' ).value.trim();
				updateLog( id, start, end );
			} );
		} );
	}

	function updateLog(logId, start, end) {
		if ( !start ) {
			setStatus( 'لطفاً زمان شروع را وارد کنید.', 'error' );
			return;
		}
		const ajaxUrl  = SITE_URL + '/wp-admin/admin-ajax.php';
		const formData = new FormData();
		formData.append( 'action', 'xc_pm_time_logs_admin_update' );
		formData.append( 'log_id', logId );
		formData.append( 'start', start );
		formData.append( 'end', end || '' );

		setStatus( 'در حال ذخیره...', 'info' );

		fetchWithAuth( ajaxUrl, {
			method: 'POST',
			body: formData
		} )
			.then( res => res.json() )
			.then( data => {
				if ( data.success ) {
					setStatus( '✅ لاگ ویرایش شد.', 'success' );
					editingLogId = null;
					loadRecentLogs();
				} else {
					setStatus( '❌ خطا: ' + ( data.data.message || 'خطای ناشناخته' ), 'error' );
				}
			} )
			.catch( () => setStatus( '❌ خطا در ارتباط با سرور.', 'error' ) );
	}

	// ---- راه‌اندازی Datepicker و رویدادها ----
	if ( typeof jalaliDatepicker !== 'undefined' ) {
		jalaliDatepicker.startWatch( {
			time: true,
			hasSecond: false,
			separatorChars: {
				date: '/',
				between: ' ',
				time: ':'
			},
			persianDigits: false
		} );
	}

	finalStart.addEventListener( 'change', recalculateFinalizeDuration );
	finalEnd.addEventListener( 'change', recalculateFinalizeDuration );
	finalStart.addEventListener( 'input', recalculateFinalizeDuration );
	finalEnd.addEventListener( 'input', recalculateFinalizeDuration );

	recentLogListContainer.addEventListener( 'change', function(e) {
		if ( e.target.classList.contains( 'edit-start' ) || e.target.classList.contains( 'edit-end' ) ) {
			recalculateEditDuration( e.target.closest( '.log-item' ) );
		}
	} );
	recentLogListContainer.addEventListener( 'input', function(e) {
		if ( e.target.classList.contains( 'edit-start' ) || e.target.classList.contains( 'edit-end' ) ) {
			recalculateEditDuration( e.target.closest( '.log-item' ) );
		}
	} );

	// ---- رویدادهای اصلی ----
	loginBtn.addEventListener( 'click', () => login( usernameInput.value.trim(), passwordInput.value.trim() ) );
	passwordInput.addEventListener( 'keydown', e => { if ( e.key === 'Enter' ) loginBtn.click(); } );
	usernameInput.addEventListener( 'keydown', e => { if ( e.key === 'Enter' ) loginBtn.click(); } );
	logoutBtn.addEventListener( 'click', logout );

	startBtn.addEventListener( 'click', startTimer );
	stopBtn.addEventListener( 'click', stopTimer );
	cancelBtn.addEventListener( 'click', cancelTimer );
	submitLogBtn.addEventListener( 'click', submitLog );
	refreshLogsBtn.addEventListener( 'click', loadRecentLogs );

	newProjectSelect.addEventListener( 'change', function() {
		loadTasks( this.value, newTaskSelect );
	} );

	addTaskBtn.addEventListener( 'click', function() {
		const projectId = newProjectSelect.value;
		if ( !projectId ) return setStatus( 'ابتدا پروژه را انتخاب کنید.', 'error' );
		const taskName = prompt( 'نام تسک جدید:' );
		if ( taskName ) addNewTask( projectId, taskName );
	} );

	// ---- شروع برنامه ----
	restoreToken();
} );