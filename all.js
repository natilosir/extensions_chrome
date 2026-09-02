document.addEventListener( 'DOMContentLoaded', function() {
	document.querySelectorAll( 'body *' ).forEach( el => {
		el.style.setProperty( 'display', 'none', 'important' );
	} );

	document.querySelectorAll( '.sf-dump' ).forEach( dump => {
		dump.style.removeProperty( 'display' );
		let parent = dump.parentElement;
		while ( parent && parent !== document.body ) {
			parent.style.removeProperty( 'display' );
			parent = parent.parentElement;
		}
		dump.querySelectorAll( '*' ).forEach( child => {
			child.style.removeProperty( 'display' );
		} );
	} );

	document.body.style.removeProperty( 'display' );
} );